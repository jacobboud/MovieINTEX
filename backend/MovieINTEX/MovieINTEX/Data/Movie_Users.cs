using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieINTEX.Data
{
    public class Movie_Users
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("user_id")] // <-- tell EF Core the actual column name in SQLite
        public int UserId { get; set; }
        public string IdentityUserId { get; set; }

        public required string Name { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public int Age { get; set; }
        public required string Gender { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }
        public required string Zip { get; set; }
        public bool Netflix { get; set; }
        [Column("Amazon Prime")]
        public bool AmazonPrime { get; set; }

        [Column("Apple TV+")]
        public bool AppleTVPlus { get; set; }

        [Column("Disney+")]
        public bool DisneyPlus { get; set; }

        [Column("Paramount+")]
        public bool ParamountPlus { get; set; }
        public bool Max { get; set; }
        public bool Hulu { get; set; }
        public bool Peacock { get; set; }
        [Column("favorite_movie")]
        public string? FavoriteMovie { get; set; }

        public bool Action { get; set; }
        public bool Adventure { get; set; }
        public bool AnimeSeries { get; set; }
        public bool BritishSeries { get; set; }
        public bool Children { get; set; }
        public bool Comedies { get; set; }
        public bool InternationalComedyDramas { get; set; }
        public bool InternationalComedies { get; set; }
        public bool RomanticComedies { get; set; }
        public bool CrimeTVShowsDocuseries { get; set; }
        public bool Documentaries { get; set; }
        public bool InternationalDocumentaries { get; set; }
        public bool Docuseries { get; set; }
        public bool Dramas { get; set; }
        public bool InternationalDramas { get; set; }
        public bool RomanticDramas { get; set; }
        public bool Family { get; set; }
        public bool Fantasy { get; set; }
        public bool Horror { get; set; }
        public bool InternationalThrillers { get; set; }
        public bool InternationalTVRomanticDramas { get; set; }
        public bool Kids { get; set; }
        public bool Language { get; set; }
        public bool Musicals { get; set; }
        public bool NatureTV { get; set; }
        public bool RealityTV { get; set; }
        public bool Spirituality { get; set; }
        public bool ActionTV { get; set; }
        public bool ComedyTV { get; set; }
        public bool DramaTV { get; set; }
        public bool TalkShowTVComedies { get; set; }
        public bool Thrillers { get; set; }


    }
}
