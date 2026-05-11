import React from 'react';
import { Package } from 'lucide-react';
import { Listing } from '../types';

interface ListingImageProps {
  listing: Listing;
  className?: string;
  imageClassName?: string;
  alt?: string;
}

const getPackageImages = (listing: Listing) =>
  (listing.packageItems || [])
    .map((item) => item.includedListing?.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
    .slice(0, 6);

export const ListingImage: React.FC<ListingImageProps> = ({ listing, className = 'h-full w-full', imageClassName = 'h-full w-full object-cover', alt }) => {
  if (listing.imageUrl) {
    return <img src={listing.imageUrl} alt={alt || listing.title} className={imageClassName} referrerPolicy="no-referrer" />;
  }

  const packageImages = listing.isPackage ? getPackageImages(listing) : [];

  if (packageImages.length > 0) {
    return (
      <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.28),transparent_35%)]" />
        <div className={`relative grid h-full w-full gap-1 p-1 ${packageImages.length === 1 ? 'grid-cols-1' : packageImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
          {packageImages.map((src, index) => (
            <div key={`${src}-${index}`} className={`relative overflow-hidden rounded-lg bg-slate-800 ${packageImages.length === 3 && index === 0 ? 'row-span-2' : ''}`}>
              <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-900 shadow-lg backdrop-blur">
          <Package size={11} />
          Pack
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-800 to-indigo-950 text-white ${className}`}>
      <div className="text-center">
        <Package size={28} className="mx-auto mb-2 opacity-80" />
        <div className="text-xs font-black uppercase tracking-[0.18em] opacity-80">TuniBots Pack</div>
      </div>
    </div>
  );
};
