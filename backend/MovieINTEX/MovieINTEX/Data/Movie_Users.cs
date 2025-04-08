using System.ComponentModel.DataAnnotations;

namespace MovieINTEX.Data
{
    public class Movie_Users
    {
        [Key]
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public bool Netflix { get; set; }
        public bool AmazonPrime { get; set; }
        public bool DisneyPlus { get; set; }
        public bool ParamountPlus { get; set; }
        public bool Max { get; set; }
        public bool Hulu { get; set; }
        public bool AppleTVPlus { get; set; }
        public bool Peacock { get; set; }
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
