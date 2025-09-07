import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../state/useAppStore";
import { feelingsData } from "../lib/feelings";
import { generateDirectFeelingImage } from "../lib/compose";
import { analytics } from "../lib/analytics";
import CategoryTabs from "../components/CategoryTabs";
import Tile from "../components/Tile";
import LanguageSelector from "../components/LanguageSelector";
import HighContrastToggle from "../components/HighContrastToggle";
import PrintButton from "../components/PrintButton";
import NormalPrintButton from "../components/NormalPrintButton";
import Toast from "../components/Toast";

const PHRASES = [
  "Grabbing a fresh notebook",
  "Unpacking digital suitcases",
  "Fluffing the data pillows",
  "Mixing bits and bytes",
  "Sipping virtual lemonade",
  "Organizing our toolbox",
  "Polishing the code gears",
  "Syncing friendly vibes",
  "Stirring the logic soup",
  "Counting happy photons",
  "Stretching neural muscles",
  "Heating up inspiration",
  "Sharpening pencils of thought",
  "Aligning tiny magnets",
  "Loading gentle whispers",
  "Collecting cozy moments",
  "Dusting off metadata",
  "Filling jars with ideas",
  "Painting pixels calmly",
  "Humming a hopeful tune",
  "Tuning the memory strings",
  "Planting seeds of knowledge",
  "Tickling the algorithm",
  "Checking compass bearings",
  "Straightening virtual frames",
  "Flipping through storybooks",
  "Brewing a calm breeze",
  "Gathering morning sunshine",
  "Building paper airplanes",
  "Stacking rainbow blocks",
  "Sorting candy-colored bytes",
  "Smoothing silk threads",
  "Tracing friendly footprints",
  "Popping bubble wrap of joy",
  "Charting starlit maps",
  "Holding doors for packets",
  "Rolling out welcome mats",
  "Measuring teaspoons of code",
  "Setting up campfires",
  "Ordering extra sprinkles",
  "Calibrating curiosity meters",
  "Baking binary cupcakes",
  "Folding origami cranes",
  "Teaching zeros to dance",
  "Untangling headphone cords",
  "Watering pixel plants",
  "Polishing friendly robots",
  "Fanning creative sparks",
  "Catching cloud daydreams",
  "Wrapping ideas in bows",
  "Lining up shiny marbles",
  "Refilling positivity jars",
  "Adjusting comfy armchairs",
  "Writing upbeat postcards",
  "Bundling fresh insights",
  "Whistling while we work",
  "Inflating imagination balloons",
  "Adding glitter to graphs",
  "Organizing sticker albums",
  "Labeling treasure chests",
  "Herding playful kittens",
  "Filling sails with breeze",
  "Lighting lanterns of hope",
  "Planting window gardens",
  "Sewing quilted patterns",
  "Skipping stones of thought",
  "Mapping secret passages",
  "Placing bookmarks gently",
  "Gifting virtual high‑fives",
  "Composing warm melodies",
  "Harvesting idea berries",
  "Bouncing rubber duckies",
  "Pressing subtle pause",
  "Sweeping porch steps",
  "Recharging kindness batteries",
  "Stacking library books",
  "Sorting postcards by color",
  "Arranging puzzle pieces",
  "Flipping pancakes of code",
  "Carving wooden whistles",
  "Spinning tiny windmills",
  "Plaiting friendship bracelets",
  "Wrapping up loose ends",
  "Coloring inside lines",
  "Collecting lost buttons",
  "Sanding smooth surfaces",
  "Gluing googly eyes",
  "Mapping rainbow arcs",
  "Selecting comfy pillows",
  "Baking cinnamon smiles",
  "Snapping happy photos",
  "Beaming friendly signals",
  "Raking autumn leaves",
  "Drawing chalk doodles",
  "Sniffing fresh bread",
  "Hanging string lights",
  "Pruning bonsai trees",
  "Picking blueberries",
  "Stocking lemonade stand",
  "Opening storybook gates",
  "Crocheting cozy scarves",
  "Lighting birthday candles",
  "Filling piñatas with laughs",
  "Turning pages softly",
  "Kneading pizza dough",
  "Skipping rope rhythms",
  "Floating paper boats",
  "Blowing cotton clouds",
  "Catching ladybugs",
  "Balancing smooth stones",
  "Tracing shooting stars",
  "Pouring honey thoughts",
  "Splashing paint playfully",
  "Juggling colorful scarves",
  "Tuning toy ukuleles",
  "Counting fireflies",
  "Flipping calendar pages",
  "Folding paper hearts",
  "Gathering seashells",
  "Sipping cocoa carefully",
  "Threading magic beads",
  "Sharing umbrella shade",
  "Baking gingerbread code",
  "Combing sandy beaches",
  "Installing happy updates",
  "Refining sunrise gradients",
  "Filling bird feeders",
  "Tossing confetti gently",
  "Spreading picnic blankets",
  "Lighting sparklers",
  "Whittling soft whistles",
  "Grazing fluffy clouds",
  "Cherishing warm mittens",
  "Scaling candy mountains",
  "Scooping ice cream bytes",
  "Paddling calm rivers",
  "Capturing moonbeams",
  "Applying gentle polish",
  "Bundling starlight packets",
  "Creating chalk rainbows",
  "Stringing popcorn garlands",
  "Pressing flower petals",
  "Clipping paper coupons",
  "Spooling cotton reels",
  "Braiding bright ribbons",
  "Planting story seeds",
  "Surfing easy breezes",
  "Drizzling caramel thoughts",
  "Whisking marshmallow fluff",
  "Squeezing citrus smiles",
  "Placing stepping stones",
  "Rolling snowball ideas",
  "Carving pumpkin grins",
  "Frothing latte letters",
  "Waving friendly pennants",
  "Twirling maple leaves",
  "Opening treasure maps",
  "Unfolding paper fans",
  "Arranging pebbled paths",
  "Fueling rocket dreams",
  "Sweeping stargazer decks",
  "Curing stage jitters",
  "Refilling ink wells",
  "Sculpting sandcastles",
  "Aligning domino trails",
  "Stacking waffle towers",
  "Listening for echoes",
  "Twisting balloon animals",
  "Drawing treasure X",
  "Cleaning kaleidoscopes",
  "Stacking card houses",
  "Sketching gentle swirls",
  "Clicking castanets softly",
  "Launching kite strings",
  "Meandering garden paths",
  "Penciling soft outlines",
  "Tracing gentle curves",
  "Seeding galaxy gardens",
  "Ticking pocket watches",
  "Tuning wind chimes",
  "Prepping snow‑cone syrup",
  "Spreading warm butter",
  "Gathering dandelion fluff",
  "Feathering nest pillows",
  "Hanging paper lanterns",
  "Arranging sunflower bouquets",
  "Mending patchwork quilts",
  "Gilding picture frames",
  "Smoothing beach towels",
  "Gathering pinecones",
  "Copying soft lullabies",
  "Buttoning cozy coats",
  "Splashing puddles lightly",
  "Wrapping winter scarves",
  "Threading popcorn chains",
  "Arranging tea biscuits",
  "Catching morning dew",
  "Stretching rainbow bridges",
  "Lining cupcake pans",
  "Knotting friendship cords",
  "Quieting library whispers",
  "Muffling snow footsteps",
  "Doodling sunny faces",
  "Updating kindness logs",
  "Lighting porch lanterns",
  "Weaving hammock ropes",
  "Stringing fairy lights",
  "Canning sweet preserves",
  "Stamping travel passports",
  "Refilling soap bubbles",
  "Cruising gentle waves",
  "Pairing mismatched socks",
  "Clipping garden herbs",
  "Coiling jump ropes",
  "Arranging chess pieces",
  "Flipping storytime tabs",
  "Porting picnic baskets",
  "Inflating beach balls",
  "Measuring tiny footprints",
  "Hammering toy nails",
  "Guiding paper airplanes",
  "Tracing gentle ripples",
  "Frosting birthday cakes",
  "Mirroring moonlit ponds",
  "Drifting cotton swirls",
  "Sprinkling powdered sugar",
  "Ringing bicycle bells",
  "Floating feather wishes",
  "Thawing frozen smiles",
  "Collecting lucky pennies",
  "Aligning stepping stools",
  "Kicking autumn acorns",
  "Whirling pinwheels",
  "Rhyming silly poems",
  "Sprouting bean sprouts",
  "Lacing sneaker strings",
  "Nesting tiny sparrows",
  "Chalking hopscotch squares",
  "Bundling yarn skeins",
  "Jotting sweet doodles",
  "Hopping pebble trails",
  "Stitching secret pockets",
  "Backspacing typos",
  "Holding golden bookmarks",
  "Cheering gentle victories",
  "Rinsing paintbrush tips",
  "Fanning paper notes",
  "Flipping library tabs",
  "Sailing gentle breezes",
  "Counting soft heartbeats",
  "Peeling citrus slices",
  "Threading soft melodies",
  "Balancing toy blocks",
  "Lulling sleepy dragons",
  "Nibbling ginger snaps",
  "Polishing marble tops",
  "Harvesting honeycomb",
  "Whispering bedtime tales",
  "Hugging teddy bears",
  "Catching soap bubbles",
  "Stirring cocoa swirls",
  "Ticking gentle timers",
  "Collecting star stickers",
  "Floating dandelion seeds",
  "Juggling soft pillows",
  "Stacking donut rings",
  "Planting lily bulbs",
  "Kissing boo‑boos better",
  "Guarding secret gardens",
  "Reeling kite spools",
  "Guiding gentle raindrops",
  "Seasoning noodle soups",
  "Arranging pastel crayons",
  "Singing shower songs",
  "Feeding rubber ducks",
  "Blending berry smoothies",
  "Folding pajamas neatly",
  "Cropping photo corners",
];

const PHRASE_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFD93D", // Yellow
  "#1A535C", // Dark teal
  "#FFB6B9", // Pink
  "#6A89CC", // Blue
  "#38ADA9", // Green
  "#F8A5C2", // Light pink
  "#60A3D9", // Sky blue
  "#F6D365", // Light yellow
  "#B8E994", // Light green
  "#F3A683", // Orange
  "#786FA6", // Purple
  "#574B90", // Deep purple
  "#3DC1D3", // Cyan
  "#E17055", // Coral
  "#00B894", // Emerald
  "#00B8D4", // Bright blue
  "#F9CA24", // Gold
  "#EA8685", // Soft red
];

const Board: React.FC = () => {
  const navigate = useNavigate();
  const { avatar, language, setLanguage, setCurrentCategory, currentCategory } =
    useAppStore();

  const [composedTiles, setComposedTiles] = useState<Map<string, Blob>>(
    new Map()
  );
  const [composedUrls, setComposedUrls] = useState<Map<string, string>>(
    new Map()
  );
  const [isComposing, setIsComposing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [imagesCreated, setImagesCreated] = useState(0);

  // Set default category if none selected
  useEffect(() => {
    if (!currentCategory) {
      setCurrentCategory("goodBody");
    }
  }, [currentCategory, setCurrentCategory]);

  // Rotate phrases every 4 seconds while composing
  useEffect(() => {
    if (!isComposing) return;

    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % PHRASES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isComposing]);

  // Generate feeling images directly from uploaded photo
  useEffect(() => {
    if (!avatar?.originalFile) {
      navigate("/");
      return;
    }

    const composeAllTiles = async () => {
      setIsComposing(true);
      setImagesCreated(0);
      const newComposedTiles = new Map<string, Blob>();
      const newComposedUrls = new Map<string, string>();

      try {
        // Process only first tile for debugging
        let processedCount = 0;
        const maxTiles = 1; // Debug: only process 1 image
        const totalTiles = maxTiles;

        for (const category of feelingsData) {
          for (const tile of category.tiles) {
            if (processedCount >= maxTiles) break;

            try {
              console.log(
                `🔄 Processing tile ${processedCount + 1}/${totalTiles}: ${
                  tile.key
                }`
              );
              console.log(`📸 Original image URL:`, tile.assetPath);

              const composedBlob = await generateDirectFeelingImage(
                avatar.originalFile,
                tile.assetPath,
                tile.key
              );

              const composedUrl = URL.createObjectURL(composedBlob);
              console.log(
                `✅ Generated personalized URL for ${tile.key}:`,
                composedUrl
              );
              console.log(
                `📊 Blob size: ${composedBlob.size} bytes, type: ${composedBlob.type}`
              );

              newComposedTiles.set(tile.key, composedBlob);
              newComposedUrls.set(tile.key, composedUrl);

              processedCount++;
              setImagesCreated(processedCount);
            } catch (error) {
              console.error(`❌ Failed to compose tile ${tile.key}:`, error);
              // Continue with other tiles even if one fails
              processedCount++;
              setImagesCreated(processedCount);
            }
          }
          if (processedCount >= maxTiles) break;
        }

        setComposedTiles(newComposedTiles);
        setComposedUrls(newComposedUrls);
      } catch (error) {
        console.error("Failed to compose tiles:", error);
        setToast({
          message: "Failed to generate personalized feeling images",
          type: "error",
        });
      } finally {
        setIsComposing(false);
      }
    };

    composeAllTiles();
  }, [avatar, navigate]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      composedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [composedUrls]);

  const currentCategoryData = useMemo(() => {
    return feelingsData.find((cat) => cat.key === currentCategory);
  }, [currentCategory]);

  const handleLanguageChange = (newLanguage: typeof language) => {
    setLanguage(newLanguage);
    analytics.languageChanged(newLanguage);
  };

  if (!avatar) {
    return (
      <div className="min-h-screen">
        <div className="main-container center-content">
          <div className="card text-center">
            <h1 className="text-2xl font-bold text-error mb-md">
              No Avatar Found
            </h1>
            <p className="text-text-secondary mb-lg">
              Please upload a photo to create your avatar first.
            </p>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Upload Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="main-container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-xl gap-lg w-full">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-sm">My Feelings</h1>
            <p className="text-text-secondary">
              Tap any feeling to hear it spoken aloud
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-md items-center justify-center">
            <div className="flex flex-row gap-md items-center justify-center">
              <LanguageSelector
                value={language}
                onChange={handleLanguageChange}
                disabled={isComposing}
              />
              <HighContrastToggle />
            </div>

            {/* Print Buttons */}
            {composedTiles.size > 0 && (
              <div className="flex flex-row gap-sm items-center justify-center">
                <NormalPrintButton disabled={isComposing} />
                <PrintButton
                  categories={feelingsData}
                  composedTiles={composedTiles}
                  disabled={isComposing}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={feelingsData}
          currentCategory={currentCategory}
          onCategoryChange={setCurrentCategory}
          language={language}
        />

        {/* Tiles Grid */}
        {isComposing ? (
          <div className="center-content">
            <div className="animate-pulse text-lg font-semibold mb-sm">
              Creating your personalized feeling images...
            </div>
            <div className="text-2xl font-bold mb-sm text-primary">
              {imagesCreated} / 1 images created
            </div>
            <div
              className="text-xl font-medium mb-sm transition-all duration-500 ease-in-out"
              style={{
                color: PHRASE_COLORS[currentPhraseIndex % PHRASE_COLORS.length],
                textAlign: "center",
              }}
            >
              {PHRASES[currentPhraseIndex]}
            </div>
            <p className="text-text-secondary">
              Using AI to transform your photo into cartoon-style feeling
              images. This may take a few minutes.
            </p>
          </div>
        ) : currentCategoryData ? (
          <>
            <div className="category-heading">
              {currentCategoryData.label[language]}
            </div>
            <div className="collage-grid mb-xl">
              {currentCategoryData.tiles.map((tile) => (
                <Tile
                  key={tile.key}
                  tile={tile}
                  language={language}
                  composedImageUrl={composedUrls.get(tile.key)}
                  disabled={isComposing}
                />
              ))}
            </div>

            {/* All categories for print-all-categories mode */}
            <div className="all-categories-print">
              {feelingsData.map((category) => (
                <div key={category.key} className="category-section">
                  <div className="category-heading">
                    {category.label[language]}
                  </div>
                  <div className="collage-grid mb-xl">
                    {category.tiles.map((tile) => (
                      <Tile
                        key={tile.key}
                        tile={tile}
                        language={language}
                        composedImageUrl={composedUrls.get(tile.key)}
                        disabled={isComposing}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* Print Button */}
        {composedTiles.size > 0 && (
          <div className="text-center">
            <PrintButton
              categories={feelingsData}
              composedTiles={composedTiles}
              disabled={isComposing}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-md mt-xl">
          <button
            onClick={() => navigate("/")}
            className="btn btn-secondary"
            disabled={isComposing}
          >
            Upload New Photo
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-xl p-lg bg-surface rounded-lg">
          <h3 className="font-semibold mb-sm">How to use:</h3>
          <ul className="text-sm text-text-secondary space-y-xs">
            <li>• Tap any feeling tile to hear it spoken</li>
            <li>• Use the language selector to change the spoken language</li>
            <li>• Switch between categories using the tabs above</li>
            <li>• Print a collage to keep all your feelings</li>
            <li>
              • Use keyboard navigation: Tab to move, Enter/Space to speak
            </li>
          </ul>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Board;
