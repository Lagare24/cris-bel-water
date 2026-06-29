"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyBrandPalettes,
  BRAND_DARK_STORAGE_KEY,
  BRAND_LIGHT_STORAGE_KEY,
  BRAND_PALETTES,
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
  type BrandPaletteId,
} from "@/lib/brand-theme";

export function BrandThemeSelector() {
  const [open, setOpen] = React.useState(false);
  const [lightPalette, setLightPalette] = React.useState<BrandPaletteId>(DEFAULT_LIGHT_PALETTE);
  const [darkPalette, setDarkPalette] = React.useState<BrandPaletteId>(DEFAULT_DARK_PALETTE);

  React.useEffect(() => {
    const savedLight = localStorage.getItem(BRAND_LIGHT_STORAGE_KEY) as BrandPaletteId | null;
    const savedDark = localStorage.getItem(BRAND_DARK_STORAGE_KEY) as BrandPaletteId | null;
    const initialLight = savedLight ?? DEFAULT_LIGHT_PALETTE;
    const initialDark = savedDark ?? DEFAULT_DARK_PALETTE;

    setLightPalette(initialLight);
    setDarkPalette(initialDark);
    applyBrandPalettes(initialLight, initialDark);
  }, []);

  const handleSave = () => {
    applyBrandPalettes(lightPalette, darkPalette);
    localStorage.setItem(BRAND_LIGHT_STORAGE_KEY, lightPalette);
    localStorage.setItem(BRAND_DARK_STORAGE_KEY, darkPalette);
    setOpen(false);
    toast.success("Brand colors updated for light and dark mode");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="border border-[hsl(var(--brand-on-surface)/0.28)] bg-[hsl(var(--brand-on-surface)/0.14)] text-[hsl(var(--brand-on-surface))] hover:bg-[hsl(var(--brand-on-surface)/0.22)]"
        title="Brand color settings"
      >
        <Palette className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Brand Color Settings
            </DialogTitle>
            <DialogDescription>
              Choose separate branding palettes for day and dark mode.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Light Mode Palette</p>
              <Select value={lightPalette} onValueChange={(value) => setLightPalette(value as BrandPaletteId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select light palette" />
                </SelectTrigger>
                <SelectContent>
                  {BRAND_PALETTES.map((palette) => (
                    <SelectItem key={`light-${palette.id}`} value={palette.id}>
                      {palette.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Dark Mode Palette</p>
              <Select value={darkPalette} onValueChange={(value) => setDarkPalette(value as BrandPaletteId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dark palette" />
                </SelectTrigger>
                <SelectContent>
                  {BRAND_PALETTES.map((palette) => (
                    <SelectItem key={`dark-${palette.id}`} value={palette.id}>
                      {palette.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Brand Colors</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
