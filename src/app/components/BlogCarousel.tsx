import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BlogPost } from "../hooks/useBlogPosts";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface BlogCarouselProps {
  posts: BlogPost[];
  compact?: boolean;
}

export function BlogCarousel({ posts, compact = false }: BlogCarouselProps) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: compact ? 4 : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: compact ? 3 : 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="blog-carousel">
      <Slider {...settings}>
        {posts.map((post) => (
          <div key={post.id} className="px-3 py-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
              <div className={`relative overflow-hidden ${compact ? "h-36" : "h-48"}`}>
                <img 
                  src={post.image || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50aW5nfGVufDF8fHx8MTc3MjY1Njk4Mnww&ixlib=rb-4.1.0&q=80&w=1080'} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {post.category}
                </div>
              </div>
              <div className={`flex-1 flex flex-col ${compact ? "p-4" : "p-5"}`}>
                <h3 className={`font-semibold text-gray-900 line-clamp-2 ${compact ? "text-base mb-1" : "text-lg mb-2"}`}>
                  {post.title}
                </h3>
                <p className={`text-gray-600 flex-1 ${compact ? "text-xs mb-3 line-clamp-2" : "text-sm mb-4 line-clamp-3"}`}>
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                </div>
                <Link
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors mt-auto"
                >
                  Ler mais
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
