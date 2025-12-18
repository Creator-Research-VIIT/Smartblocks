declare module "react-slick" {
  import { ComponentType } from "react";

  interface Settings {
    accessibility?: boolean;
    adaptiveHeight?: boolean;
    arrows?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    centerMode?: boolean;
    className?: string;
    dots?: boolean;
    draggable?: boolean;
    fade?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    pauseOnHover?: boolean;
    [key: string]: any; // allow extra props
  }

  const Slider: ComponentType<Settings>;

  export default Slider;
}
