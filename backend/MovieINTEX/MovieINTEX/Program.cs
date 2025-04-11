using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;
using System.Security.Claims;
using MovieINTEX.Models.Dto;
using MovieINTEX.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.FileProviders;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MovieConnection")));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("IdentityConnection")));

builder.Services.AddScoped<IRecommendationService, RecommendationService>();

builder.Services.AddAuthorization();

builder.Services.AddTransient(typeof(IEmailSender<>), typeof(NoOpEmailSender<>));


builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// builder.Services.AddIdentityApiEndpoints<IdentityUser>()
//     .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Email; // Ensure email is stored in claims
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;

});

builder.Services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>, CustomUserClaimsPrincipalFactory>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.Name = "AspNetCore.Identity.Application";

    // options.LoginPath = "";
    // options.LoginPath = "/login"; // This value isn't actually used, but it's fine
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    options.LoginPath = ""; // disables automatic redirect
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401; // 🔐 Tell frontend: you're not logged in
        return Task.CompletedTask;
    };

});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(options =>
    {
        // Set the default scheme for sign-in and challenges
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
    {
        options.SignInScheme = IdentityConstants.ExternalScheme;
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
        options.CallbackPath = "/signin-google";
    });


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseCors("AllowFrontend");


app.UseHttpsRedirection();


app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapIdentityApi<IdentityUser>();



app.MapGet("/auth-status", (ClaimsPrincipal user) =>
{
    var isAuthenticated = user.Identity?.IsAuthenticated ?? false;
    return Results.Ok(new { isAuthenticated });
});



app.MapGet("/login-google", async context =>
{
    var props = new AuthenticationProperties
    {
        RedirectUri = "https://localhost:3000/new-user" // ✅ Full redirect to frontend
    };
    await context.ChallengeAsync(GoogleDefaults.AuthenticationScheme, props);
});

app.MapGet("/signin-google", async (
    HttpContext httpContext,
    UserManager<IdentityUser> userManager,
    SignInManager<IdentityUser> signInManager,
    MovieDbContext movieDbContext) =>
{
    var info = await signInManager.GetExternalLoginInfoAsync();
    if (info == null)
    {
        Console.WriteLine("❌ External login info is null");
        return Results.Redirect("https://localhost:3000/login-failed");
    }

    IdentityUser user;
    var signInResult = await signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, false);

    if (!signInResult.Succeeded)
    {
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        var name = info.Principal.FindFirstValue(ClaimTypes.Name) ?? "No Name";

        user = new IdentityUser
        {
            Email = email,
            UserName = email
        };

        var result = await userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        await userManager.AddLoginAsync(user, info);
        await userManager.AddToRoleAsync(user, "User");

        var movieUser = new Movie_Users
        {
            Email = email,
            Name = name,
            IdentityUserId = user.Id,
            Phone = "123-123-1234",
            Gender = "Male",
            City = "Provo",
            State = "UT",
            Zip = "84604",
            Age = 33
        };

        movieDbContext.movies_users.Add(movieUser);
        await movieDbContext.SaveChangesAsync();
    }
    else
    {
        user = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
    }

    // ✅ Actually sign in and issue the identity cookie
    await signInManager.SignInAsync(user, isPersistent: false);

    // ✅ Make sure the auth cookie is flushed before redirect
    await httpContext.Response.CompleteAsync(); // <-- This helps persist the cookie

    Console.WriteLine("✅ Google SignIn complete: user = " + user.Email);

    return Results.Redirect("https://localhost:3000/new-user");
});





app.MapPost("/custom-register", async (
    RegisterDto model,
    UserManager<IdentityUser> userManager,
    SignInManager<IdentityUser> signInManager, // 👈 add this
    MovieDbContext movieDbContext,
    HttpContext httpContext) => // 👈 add this for cookie login
{
    var identityUser = new IdentityUser
    {
        UserName = model.Email,
        Email = model.Email
    };

    var result = await userManager.CreateAsync(identityUser, model.Password);

    if (!result.Succeeded)
    {
        return Results.BadRequest(result.Errors);
    }

    await userManager.AddToRoleAsync(identityUser, "User");

    // 🧠 Sign in the user right after registration
    await signInManager.SignInAsync(identityUser, isPersistent: false);

    // ✅ Add MovieUser record
    var movieUser = new Movie_Users
    {
        Name = model.Name,
        Email = model.Email,
        Phone = model.Phone,
        Age = model.Age,
        Gender = model.Gender,
        City = model.City,
        State = model.State,
        Zip = model.Zip,
        IdentityUserId = identityUser.Id
    };

    movieDbContext.movies_users.Add(movieUser);
    await movieDbContext.SaveChangesAsync();

    return Results.Ok(new { message = "User registered and signed in." });
});




app.MapPost("/logout", async (HttpContext context, SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();

    // Ensure authentication cookie is removed
    context.Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None
    });

    return Results.Ok(new { message = "Logout successful" });
}).RequireAuthorization();


app.MapGet("/pingauth", (ClaimsPrincipal user) =>
{
    if (!user.Identity?.IsAuthenticated ?? false)
    {
        return Results.Unauthorized();
    }

    var email = user.FindFirstValue(ClaimTypes.Email) ?? "unknown@example.com";
    var roles = user.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

    return Results.Json(new { email, roles });
});


using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "Admin", "User" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}



app.Run();
