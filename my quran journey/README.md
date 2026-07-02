# Quran Garden

Quran Garden is a mobile-first Expo React Native app for children ages 4-10. It teaches Arabic letter recognition, basic pronunciation readiness, tracing practice, harakat awareness, and respectful Quran-learning habits through a calm "Garden of Letters" experience.

This MVP is local-first, does not require login, and does not collect child personal data.

## Important Quran Content Rule

No Quran ayah text, translations, transliterations, or recitation audio are included in this MVP.

The surah module currently contains only surah names and empty `ayahs` arrays. Quran-related records must remain `placeholder` or `needs_review` until reviewed content is supplied by qualified sources.

TODO before production:

- Import verified Mushaf/Quran Arabic text from a trusted source file.
- Add verified translation and transliteration sources if the product will display them.
- Add certified recitation audio files locally.
- Fill `verifiedBy`, `verifiedDate`, source metadata, and review status for every ayah.
- Have the full content reviewed by qualified teachers/scholars.

## Install

```bash
npm install
npm run deps:externalize
```

The dependency externalization step moves `node_modules` to the parent `D:\ummah360\node_modules` folder. This avoids Expo Metro's Windows fallback watcher recursing through thousands of dependency folders under `my quran journey`.

## Run

```bash
npm start
```

Then open with Expo Go, Android emulator, iOS simulator, or Expo web tooling.

Current local dev URL:

```text
http://localhost:8082
```

## Test And Typecheck

```bash
npm test
npm run typecheck
```

The current test suite covers:

- 28-letter Arabic alphabet data.
- Required letter forms.
- Progress save/load logic.
- Game answer checking.
- Verification blocking for placeholder Quran content.

## App Structure

```text
src/
  app/
  navigation/
  screens/
  components/
  data/
  services/
  store/
  i18n/
  types/
  utils/
  tests/
```

## Adding Verified Quran Content

Add verified content in a new data file or replace placeholder data in `src/data/surahs.placeholder.ts` only after review.

Each surah should follow:

```ts
{
  surahNumber: 112,
  surahNameArabic: "الإخلاص",
  surahNameEnglish: "Al-Ikhlas",
  ayahs: [
    {
      ayahNumber: 1,
      arabicText: "...verified source only...",
      translation: "...verified source only...",
      transliteration: "...verified source only...",
      audioKey: "surahs/112/001",
      verifiedSource: {
        sourceName: "Verified source name",
        sourceReference: "Edition/version/reference"
      },
      reviewStatus: "verified"
    }
  ],
  verification: {
    status: "verified",
    sourceName: "Verified source name",
    sourceReference: "Edition/version/reference",
    verifiedBy: "Qualified reviewer",
    verifiedDate: "YYYY-MM-DD"
  }
}
```

Do not paste Quran text from search results, random websites, AI output, or unreviewed files.

## Adding Audio

The audio service is in `src/services/audioService.ts`. Letter, practice-word, and gentle UI feedback audio are bundled locally under `assets/audio/` and mapped in `src/data/audioManifest.ts`.

Current audio layout:

```text
assets/audio/
  letters/
  practice-words/
  ui/
```

Learning audio can be regenerated with ElevenLabs for non-Quran content only:

```bash
ELEVENLABS_API_KEY=... npm run audio:generate
```

Optional overrides:

```bash
ELEVENLABS_VOICE_ID=... ELEVENLABS_MODEL_ID=... npm run audio:generate
```

The generator skips existing files and only creates:

- Arabic letter learning clips.
- Practice-word clips clearly labeled as not Quran text.
- Friendly feedback clips such as "Great job" and "Try again."

For Quran recitation, use local certified audio files and link them through `audioKey` only after source review. Do not generate Quran recitation with AI and do not hotlink random recitations.

## Adding New Games

Add a `GameId` in `src/types/game.ts`, a game card in `src/screens/GamesScreen.tsx`, and answer logic in `src/utils/gameLogic.ts` if needed. Keep games calm, readable, and non-competitive.

Avoid:

- Ads.
- In-app purchases.
- Leaderboards.
- Loot boxes.
- Punishment sounds.
- Pressure-based streaks.

## Known Limitations

- Letter, practice-word, and UI feedback audio are generated learning aids, not certified teacher recitation.
- Tracing records interaction but does not validate strokes.
- Surah content is placeholder-only.
- No speech scoring is included.
- Parent gate is a simple MVP math check.
- No multi-child profiles yet.

## Roadmap

- Real verified Quran database import.
- Certified reciter audio.
- Teacher dashboard.
- Multi-child profiles.
- Offline downloaded audio.
- Tajweed basics.
- Privacy-safe speech practice.
- Better tracing recognition.
- Web version.
- Classroom mode.
