# Refactoring Plan

This document outlines the plan to refactor the codebase to reduce code duplication, improve maintainability, and centralize static data.

## 1. Centralize Static Data

**Objective:** Move all hardcoded lists and static data to `constants/Data.ts` (or split into multiple files if it gets too large).

### Tasks:
- [ ] **Update `constants/Data.ts`**:
    - Add `detailedCategories` object from `app/create-listing.tsx`.
    - Add `mainCategories` array (with icons and IDs) from `app/create-listing.tsx`.
    - Add `cityCoordinates` map from `app/create-listing.tsx`.
    - Ensure `cities` and `popularSearches` are correctly exported (already done, but verify consistency).

## 2. Refactor `app/create-listing.tsx`

**Objective:** Remove hardcoded data and use imports from `constants/Data.ts`.

### Tasks:
- [ ] Remove `mainCategories` array definition.
- [ ] Remove `detailedCategories` object definition.
- [ ] Remove `getCityList` function and use `cities` import.
- [ ] Remove `getCityCoordinates` function internal map and use imported `cityCoordinates`.
- [ ] Update component logic to use these imported constants.

## 3. Refactor `app/search.tsx`

**Objective:** Use centralized popular searches.

### Tasks:
- [ ] Remove `popularSearches` array.
- [ ] Import `popularSearches` from `constants/Data.ts`.

## 4. Refactor `app/index.tsx` (Review)

**Objective:** Ensure consistency with the new category structure.

### Tasks:
- [ ] Currently, `index.tsx` uses a simple string array for categories. `create-listing.tsx` uses objects.
- [ ] **Decision:** We should export a simple `categoryNames` array derived from `mainCategories` in `constants/Data.ts` to keep `index.tsx` simple but consistent.
    - Example: `export const categoryNames = ['Tüm Kategoriler', ...mainCategories.map(c => c.name), 'Diğer'];`

## 5. Future Improvements (Backlog)

- [ ] **Custom Hooks:** Create `useProducts` hook to encapsulate Firestore logic found in `index.tsx` and `search-results.tsx`.
- [ ] **Types:** Move TypeScript interfaces (e.g., `Product`, `Category`) to a shared `types/` directory if not already present.
