import React, { useMemo, useState } from "react";
import { GROCERY_CATALOG, GROCERY_GROUPS } from "../../../utils/groceryCatalog";
import { saveGroceryPhoto, deleteGroceryPhoto } from "../../../utils/groceryPhotos";
import GroceryItemPhoto from "./GroceryItemPhoto";
import "./GroceryCatalogPicker.css";

export default function GroceryCatalogPicker({ onAdd }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All sections");
  const [customName, setCustomName] = useState("");
  const [notice, setNotice] = useState("");
  const [photoVersion, setPhotoVersion] = useState(0);
  const [photoName, setPhotoName] = useState("");
  const items = useMemo(() => GROCERY_CATALOG.filter(item =>
    (section === "All sections" || item.section === section) &&
    (!query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase()))
  ), [query, section]);
  const add = name => { onAdd(name); setNotice(`Added ${name} to your list`); };
  const addCustom = () => {
    const name = customName.trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 100) { setNotice("Enter an item name between 2 and 100 characters."); return; }
    add(name); setPhotoName(name); setCustomName("");
  };
  async function removePhoto(name) {\n    if (!window.confirm(`Remove your saved photo for ${name} from this device?`)) return;\n    try { await deleteGroceryPhoto(name); setPhotoVersion(n => n + 1); setNotice(`Photo removed for ${name}.`); }\n    catch (error) { setNotice(error.message || "Could not remove photo."); }\n  }\n  async function capture(file, name) {
    if (!file || !name) return;
    try {
      await saveGroceryPhoto(name, file);
      setPhotoVersion(n => n + 1);
      setNotice(`Photo saved on this device for ${name}. It is not uploaded or shared.`);
    } catch (error) { setNotice(error.message || "Could not save photo."); }
  }
  return <section className="gcp" aria-label="Find and add grocery items">
    <h3>Browse grocery items</h3>
    <p>Find foods by store section, or add something new you discovered.</p>
    <div className="gcp-controls">
      <label>Search items<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try yams, eggs, apples…" /></label>
      <label>Store section<select value={section} onChange={e => setSection(e.target.value)}>
        <option>All sections</option>{GROCERY_GROUPS.map(group => <option key={group}>{group}</option>)}
      </select></label>
    </div>
    <p role="status" className="gcp-status">{notice || `${items.length} items listed`}</p>
    <div className="gcp-grid">
      {items.slice(0, 72).map(item => <div key={item.id} className="gcp-item">
        <GroceryItemPhoto name={item.name} version={photoVersion} />
        <span className="gcp-name">{item.name}</span>
        <button type="button" onClick={() => add(item.name)} aria-label={`Add ${item.name}`}>+ Add</button>
        <label className="gcp-camera" title={`Add photo of ${item.name}`}>📷
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment"
            aria-label={`Take or choose a photo of ${item.name}`} onChange={e => { capture(e.target.files?.[0], item.name); e.target.value = ""; }} />
        </label>
      </div>)}
    </div>
    {items.length > 72 && <p>Showing the first 72 matches. Search or select a section to narrow results.</p>}
    {items.length === 0 && <p>No matching item. Add it below.</p>}
    <div className="gcp-custom">
      <h4>Can't find an item? Add your own</h4>
      <div className="gcp-controls">
        <label>New item name<input value={customName} maxLength={100} onChange={e => setCustomName(e.target.value)} placeholder="Write the item name" /></label>
        <button type="button" onClick={addCustom}>+ Add new item</button>
      </div>
      {photoName && <label className="gcp-upload">📷 Take or choose a photo for {photoName}
        <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment"
          onChange={e => { capture(e.target.files?.[0], photoName); e.target.value = ""; }} />
      </label>}
      {photoName && <button type="button" className="gcp-remove" onClick={() => removePhoto(photoName)}>Remove saved photo for {photoName}</button>}\n      <p>Photos stay on this device. No product recognition, barcode lookup, or cloud synchronization yet.</p>
    </div>
  </section>;
}
