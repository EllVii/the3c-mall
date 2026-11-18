// Grocery vocabulary is a discovery list, not retailer inventory or a claim of universal availability.
// Photos may be added only from verified licensed assets or user-supplied images.
const GROUPS = {
  "Produce · Fruit": "apples,bananas,oranges,mandarins,lemons,limes,grapefruit,pears,peaches,nectarines,plums,apricots,cherries,strawberries,blueberries,raspberries,blackberries,cranberries,grapes,watermelon,cantaloupe,honeydew,pineapple,mango,papaya,kiwi,pomegranate,figs,dates,persimmons,dragon fruit,guava,passion fruit,coconut,plantains",
  "Produce · Leafy greens": "romaine lettuce,iceberg lettuce,butter lettuce,green leaf lettuce,red leaf lettuce,spinach,kale,collard greens,Swiss chard,arugula,watercress,bok choy,mustard greens,turnip greens,cabbage,Napa cabbage",
  "Produce · Roots & tubers": "yams,sweet potatoes,russet potatoes,red potatoes,Yukon gold potatoes,purple potatoes,carrots,parsnips,beets,turnips,rutabaga,radishes,daikon,ginger,turmeric,jicama,cassava,taro,celeriac",
  "Produce · Vegetables": "broccoli,broccolini,cauliflower,asparagus,green beans,snap peas,snow peas,peas,Brussels sprouts,zucchini,yellow squash,acorn squash,butternut squash,spaghetti squash,pumpkin,cucumbers,celery,artichokes,eggplant,okra,corn,red bell peppers,green bell peppers,yellow bell peppers,jalapeños,serrano peppers,poblanos,habaneros,tomatoes,cherry tomatoes,tomatillos,avocados",
  "Produce · Aromatics & herbs": "yellow onions,red onions,white onions,green onions,shallots,leeks,garlic,cilantro,parsley,basil,mint,rosemary,thyme,dill,oregano,sage,chives,lemongrass",
  "Produce · Mushrooms & specialty": "white mushrooms,cremini mushrooms,portobello mushrooms,shiitake mushrooms,oyster mushrooms,enoki mushrooms,bean sprouts,alfalfa sprouts",
  "Bakery": "sandwich bread,whole wheat bread,sourdough bread,bagels,tortillas,pita bread,naan,rolls,buns,croissants,muffins",
  "Deli": "sliced turkey,sliced ham,roast beef,provolone slices,Swiss cheese slices,hummus,prepared salads",
  "Meat": "chicken breast,chicken thighs,whole chicken,ground beef,ground turkey,beef steak,beef roast,pork chops,pork shoulder,bacon,sausages,lamb chops",
  "Seafood": "salmon,cod,tilapia,shrimp,tuna,scallops,mussels,crab,halibut,catfish",
  "Dairy & Eggs": "eggs,egg whites,milk,whole milk,almond milk,oat milk,yogurt,Greek yogurt,butter,cheddar cheese,mozzarella cheese,cottage cheese,cream cheese,sour cream",
  "Frozen": "frozen peas,frozen broccoli,frozen berries,frozen spinach,frozen corn,frozen pizza,ice cream,frozen waffles",
  "Pantry": "rice,brown rice,oats,pasta,flour,sugar,olive oil,vegetable oil,black beans,pinto beans,kidney beans,chickpeas,canned tomatoes,tomato sauce,peanut butter,almond butter,salt,pepper,cinnamon",
  "Beverages": "bottled water,coffee,tea,orange juice,apple juice,sparkling water",
  "Snacks": "popcorn,pretzels,crackers,potato chips,granola bars,mixed nuts",
  "Household": "paper towels,toilet paper,dish soap,laundry detergent,trash bags",
  "Personal Care": "toothpaste,toothbrush,shampoo,conditioner,body wash",
  "Baby": "diapers,baby wipes,baby food",
  "Pharmacy": "bandages,first aid supplies",
};
export const GROCERY_GROUPS = Object.keys(GROUPS);
export const GROCERY_CATALOG = Object.entries(GROUPS).flatMap(([section, names]) =>
  names.split(",").map(name => ({ id: section + ":" + name, name, section, imageUrl: null }))
);
export function matchCatalogItem(name) {
  const normalized = String(name || "").trim().toLowerCase();
  return GROCERY_CATALOG.find(item => item.name.toLowerCase() === normalized) || null;
}
