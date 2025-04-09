namespace MovieINTEX.Models.Dto
{
    public class CarouselItemDto
    {
        public string Title { get; set; }
        public string ShowId { get; set; }
        public string Description { get; set; }
    }

    public class CarouselDto
    {
        public string Title { get; set; }
        public List<CarouselItemDto> Items { get; set; }
    }
}
