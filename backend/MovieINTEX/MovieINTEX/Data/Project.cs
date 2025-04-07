using System.ComponentModel.DataAnnotations;

namespace WaterProject.Data
{
    public class Project
    {
        [Key]
        public int ProjectID { get; set; }
        [Required]
        public string ProjectName { get; set; }
        public string? ProjectType { get; set; }
        public string? ProjectRegionalProgram { get; set; }
        public int? ProjectImpact { get; set; }
        public string? ProjectPhase { get; set; }
        public string? ProjectFunctionalityStatus { get; set; }
    }
}
