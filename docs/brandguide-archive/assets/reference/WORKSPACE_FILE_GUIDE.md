# Jeremy Fontenot Brand Assets - Workspace File Guide

This guide documents every non-venv file in this workspace and what it is used for.

## Root Folder

- `generate_branding_assets.py`: Main generator script that creates branded assets and templates.
- `compare_brand_assets.cs`: C# audit/comparison tool for validating assets against the source logo.
- `primary_logo_transparent_3000x3000.png`: Source-of-truth master logo used by generators and comparison tooling.
- `brand_assets.zip`: Packaged archive of the organized `brand_assets/` library.
- `WORKSPACE_FILE_GUIDE.md`: This file.

## Root Archive

Folder: `archive/root_legacy_exports/`

These are older duplicate exports moved from the root for cleanup, kept for rollback/reference.

- `app_icon_1024x1024.png`: Legacy app icon export.
- `banner_dark_1920x1080.png`: Legacy dark banner export.
- `banner_light_1920x1080.png`: Legacy light banner export.
- `email_logo_600x200.png`: Legacy email logo export.
- `favicon_16.png`: Legacy favicon 16x16 export.
- `favicon_32.png`: Legacy favicon 32x32 export.
- `favicon_48.png`: Legacy favicon 48x48 export.
- `favicon_64.png`: Legacy favicon 64x64 export.
- `header_dark_2500x600.png`: Legacy dark header export.
- `header_light_2500x600.png`: Legacy light header export.
- `icon_jf_1024x1024.png`: Legacy JF icon export.
- `presentation_dark_1920x1080.png`: Legacy dark presentation graphic export.
- `presentation_light_1920x1080.png`: Legacy light presentation graphic export.
- `primary_logo_dark_3000x3000.png`: Legacy dark logo export.
- `primary_logo_light_3000x3000.png`: Legacy light logo export.
- `print_transparent_4000x4000.png`: Legacy print transparent export.
- `profile_dark_1024x1024.png`: Legacy dark profile export.
- `profile_light_1024x1024.png`: Legacy light profile export.
- `profile_transparent_1024x1024.png`: Legacy transparent profile export.
- `watermark_transparent_1200x1200.png`: Legacy watermark export.

## Organized Library

Folder: `brand_assets/`

- `ASSET_MANIFEST.md`: Manifest describing deliverables and specifications.
- `GENERATION_REPORT.md`: Generation summary/report document.
- `fix_transparency.py`: Utility script that converts near-white backgrounds to transparency for selected PNGs.

### Banners

Folder: `brand_assets/banners/`

- `banner_dark_1920x1080.png`: Dark variant banner asset.
- `banner_light_1920x1080.png`: Light variant banner asset.

### Colors

Folder: `brand_assets/colors/`

- `brand_colors.aco`: Photoshop color swatch file.
- `brand_colors.ase`: Adobe swatch exchange color file.

### Email

Folder: `brand_assets/email/`

- `email_logo_600x200.png`: Logo formatted for email usage.

### Favicons

Folder: `brand_assets/favicons/`

- `favicon_16.png`: 16x16 favicon.
- `favicon_32.png`: 32x32 favicon.
- `favicon_48.png`: 48x48 favicon.
- `favicon_64.png`: 64x64 favicon.

### Fixed Transparency Outputs

Folder: `brand_assets/fixed/`

- `primary_logo_transparent_3000x3000.png`: Transparency-adjusted logo output.
- `print_transparent_4000x4000.png`: Transparency-adjusted print output.
- `profile_transparent_1024x1024.png`: Transparency-adjusted profile output.
- `watermark_transparent_1200x1200.png`: Transparency-adjusted watermark output.

### Headers

Folder: `brand_assets/headers/`

- `header_dark_2500x600.png`: Dark header asset.
- `header_light_2500x600.png`: Light header asset.

### Icons

Folder: `brand_assets/icons/`

- `app_icon_1024x1024.png`: App icon asset.
- `icon_jf_1024x1024.png`: JF icon asset.

### Logos

Folder: `brand_assets/logos/`

- `favicon_64x64.png`: Logo-set favicon (64x64 variant).
- `favicon_128x128.png`: Logo-set favicon (128x128 variant).
- `logo_black_3000x3000.png`: Monochrome dark logo variant.
- `logo_horizontal_3000x1500.png`: Horizontal logo composition.
- `logo_stacked_1500x3000.png`: Vertical/stacked logo composition.
- `logo_white_3000x3000.png`: Monochrome light logo variant.
- `primary_logo_dark_3000x3000.png`: Primary logo dark variant.
- `primary_logo_light_3000x3000.png`: Primary logo light variant.
- `primary_logo_transparent_3000x3000.png`: Primary transparent logo variant.

### Presentations

Folder: `brand_assets/presentations/`

- `presentation_dark_1920x1080.png`: Presentation graphic (dark variant).
- `presentation_light_1920x1080.png`: Presentation graphic (light variant).

### Print

Folder: `brand_assets/print/`

- `print_transparent_4000x4000.png`: High-resolution transparent print asset.

### Profiles

Folder: `brand_assets/profiles/`

- `profile_256x256.png`: Small profile/avatar asset.
- `profile_512x512.png`: Medium profile/avatar asset.
- `profile_dark_1024x1024.png`: Dark profile variant.
- `profile_light_1024x1024.png`: Light profile variant.
- `profile_transparent_1024x1024.png`: Transparent profile variant.

### Social Media

Folder: `brand_assets/social_media/`

- `linkedin_cover_1584x396.png`: LinkedIn cover image.
- `personal_website_banner_1920x480.png`: Website banner image.
- `twitter_cover_1500x500.png`: Twitter/X cover image.

### Templates

Folder: `brand_assets/templates/`

- `email_signature.html`: Branded HTML email signature template with embedded logo and contact details.
- `letterhead_template.docx`: Branded Word letterhead template with header logo and signature-style sign-off.
- `presentation_template.pptx`: Branded PowerPoint template.

### Watermarks

Folder: `brand_assets/watermarks/`

- `watermark_transparent_1200x1200.png`: Transparent watermark asset.