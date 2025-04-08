namespace MovieINTEX.Models.Dto
{
    public class CarouselsResponseDto
    {
        public string Name { get; set; } = string.Empty;
        public List<CarouselDto> Carousels { get; set; } = new();
    }
}
