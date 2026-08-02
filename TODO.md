# Multi-Image Support for Properties

## Goal
Allow landlords to upload multiple property photos so house-hunting portal users can view an image gallery after sign-up.

## Backend (rental_bck)
- [x] 1. Add `photos` JSONField to Property model
- [x] 2. Create migration for the new field (0008_add_property_photos)
- [x] 3. Update PropertySerializer to include `photos`

## Frontend (rental_front copy)
- [x] 4. PropertiesPage.jsx — multi-file upload (select multiple, show previews, store as array in localStorage)
- [x] 5. PropertyDetailPage.jsx — image gallery carousel with prev/next + dot indicators
- [x] 6. ListingsPage.jsx — show first image from array + photo count badge on cards
- [x] 7. Build verification
