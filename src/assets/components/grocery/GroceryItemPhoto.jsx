import React, { useEffect, useState } from "react";
import { readGroceryPhoto } from "../../../utils/groceryPhotos";
import { matchCatalogItem } from "../../../utils/groceryCatalog";

export default function GroceryItemPhoto({ name, size = 56, version = 0 }) {
  const [photo, setPhoto] = useState(null);
  const catalog = matchCatalogItem(name);
  useEffect(() => {
    let alive = true;
    let objectUrl = null;
    readGroceryPhoto(name).then(blob => {
      if (blob && alive) { objectUrl = URL.createObjectURL(blob); setPhoto(objectUrl); }
      else if (alive) setPhoto(null);
    }).catch(() => { if (alive) setPhoto(null); });
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [name, version]);
  const src = photo || catalog?.imageUrl;
  return src ? <img src={src} alt={name} loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }} width={size} height={size}
    style={{width:size,height:size,objectFit:"cover",borderRadius:10,flexShrink:0}} /> :
    <span role="img" aria-label={`No photo yet for ${name}`}
      style={{width:size,height:size,display:"inline-grid",placeItems:"center",borderRadius:10,
        flexShrink:0,background:"rgba(255,255,255,.10)",fontSize:26}}>📷</span>;
}
