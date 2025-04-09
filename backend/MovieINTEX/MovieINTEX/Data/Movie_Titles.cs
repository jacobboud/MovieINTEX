using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieINTEX.Data
{
    public class Movie_Titles
    {
        [Key]
        public string? show_id { get; set; }  // ⬅️ string instead of int
        public string type { get; set; }
        public string title { get; set; }
        public string? director { get; set; }
        public string? cast { get; set; }
        public string? country { get; set; }
        public int? release_year { get; set; }
        public string? rating { get; set; }
        public string? duration { get; set; }
        public string? description { get; set; }


        // Genre boolean properties
        public bool Action { get; set; }
        public bool Adventure { get; set; }
        [Column("Anime Series International TV Shows")]
        public bool AnimeSeries { get; set; }

        [Column("British TV Shows Docuseries International TV Shows")]
        public bool BritishSeries { get; set; }
        public bool Children { get; set; }
        public bool Comedies { get; set; }

        [Column("Comedies Dramas International Movies")]
        public bool InternationalComedyDramas { get; set; }
        [Column("Comedies International Movies")]
        public bool InternationalComedies { get; set; }
        [Column("Comedies Romantic Movies")]
        public bool RomanticComedies { get; set; }
        [Column("Crime TV Shows Docuseries")]
        public bool CrimeTVShowsDocuseries { get; set; }
        public bool Documentaries { get; set; }
        [Column("Documentaries International Movies")]
        public bool InternationalDocumentaries { get; set; }
        public bool Docuseries { get; set; }
        public bool Dramas { get; set; }
        [Column("Dramas International Movies")]
        public bool InternationalDramas { get; set; }
        [Column("Dramas Romantic Movies")]
        public bool RomanticDramas { get; set; }
        [Column("Family Movies")]
        public bool Family { get; set; }
        public bool Fantasy { get; set; }
        [Column("Horror Movies")]
        public bool Horror { get; set; }
        [Column("International Movies Thrillers")]
        public bool InternationalThrillers { get; set; }
        [Column("International TV Shows Romantic TV Shows TV Dramas")]
        public bool InternationalTVRomanticDramas { get; set; }
        [Column("Kids' TV")]
        public bool Kids { get; set; }
        [Column("Language TV Shows")]
        public bool Language { get; set; }
        public bool Musicals { get; set; }
        [Column("Nature TV")]
        public bool NatureTV { get; set; }
        [Column("Reality TV")]
        public bool RealityTV { get; set; }
        public bool Spirituality { get; set; }
        [Column("TV Action")]
        public bool ActionTV { get; set; }
        [Column("TV Comedies")]
        public bool ComedyTV { get; set; }
        [Column("TV Dramas")]
        public bool DramaTV { get; set; }
        [Column("Talk Shows TV Comedies")]
        public bool TalkShowTVComedies { get; set; }
        public bool Thrillers { get; set;}

    }
}
