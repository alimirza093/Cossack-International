import React from 'react';
import { Link } from 'react-router-dom';
import { GALLERY_IMAGES } from '../../lib/siteAssets';
import { MediaFrame } from '../ui/MediaFrame';
import SectionHeader from './SectionHeader';

const GallerySection: React.FC = () => (
  <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-[#0B0B0B]">
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Manufacturing Gallery"
        light
        action={
          <Link
            to="/products"
            className="border border-zinc-700 text-zinc-300 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-[#39FF14] hover:text-[#39FF14] transition-all duration-300 shrink-0"
          >
            View Catalog
          </Link>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {GALLERY_IMAGES.map((item, index) => (
          <figure
            key={item.src}
            className={`relative overflow-hidden rounded-sm border border-zinc-800 group ${
              index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
            }`}
          >
            <MediaFrame
              src={item.src}
              alt={item.alt}
              className="h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[2]" />
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default React.memo(GallerySection);
