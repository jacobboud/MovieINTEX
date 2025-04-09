using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;
using System.Security.Claims;
using MovieINTEX.Models.Dto;
using MovieINTEX.Services;


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
        policy.WithOrigins("http://localhost:3000")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
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


app.MapGet("/pingauth", async (
    ClaimsPrincipal user,
    UserManager<IdentityUser> userManager) =>
{
    if (!user.Identity?.IsAuthenticated ?? false)
    {
        return Results.Unauthorized();
    }

    var identityUser = await userManager.GetUserAsync(user);
    if (identityUser == null)
    {
        return Results.Unauthorized();
    }

    var roles = await userManager.GetRolesAsync(identityUser);
    var email = identityUser.Email ?? "unknown@example.com";

    return Results.Json(new
    {
        email = email,
        roles = roles
    });
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
