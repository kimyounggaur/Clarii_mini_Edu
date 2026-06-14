# PRO C20 Source Inventory

This document records the local sources used for the Clarii PRO C20 learning feature.

## Local Files

Source folder:

```text
D:\256G 1\01 레슨디자이너-반응형 웹사이트\클라리미니 연주 웹앱\01 Source(Clarii_Mini_Pro_C20)
```

Files:

```text
Clarii_PRO_C20_User_s_Manual_EN_V3.1.pdf
C20-1_3x_c21249d0-16dc-429d-8b31-c6060ff81aac (1).png
C20-3_3x_ebbcb959-be59-4dd2-bfc7-c3561460cce5.png
C20-4_3x_e1a7e3b0-5474-4888-a0ba-cc137b2ad812.png
C20-5_3x_c8f09374-585c-49ba-831a-318a59e3d557.png
C20-6_3x_65e66052-ce5a-42a8-bcd2-5cb32cd50bd1.png
```

## Manual Facts Used

- Manual: `Clarii_PRO_C20_User_s_Manual_EN_V3.1.pdf`
- ClariiOS version: 3.1
- Product: Robkoo Clarii PRO C20
- Concept: 14-key Boehm layout, DuoEngine, 100 sounds, 179 articulations
- Playing position: left hand above right hand; left thumb rests between textured octave rollers; right thumb supports near the pitch bend plates or detachable thumb hook; neck strap recommended.
- Fingering mode families:
  - EWI-compatible: EWI, Dizi, Hulusi, EWI (F), EVI
  - Traditional: Saxophone, Whistle
  - Robkoo system: ROBKOO Sax, ROBKOO Dizi, ROBKOO Hulusi
- Appendix fingering charts:
  - Manual pages 61-68
  - PDF pages around 34-37
  - These pages require visual/manual transcription because automatic text extraction does not preserve the chart graphics.

## Panel Description Summary

- Front and side controls: mouthpiece cap, flat/saxophone mouthpieces, breath light, note keys, Bis, LP1, LP2, asterisk keys, plus/minus keys, RP1, RP2, RP3, dual speakers, Bluetooth controls, voice microphone.
- Back controls: display, favorite buttons 1/2/3, directional buttons and OK, eight octave rollers, portamento plate, strap ring, upper/lower pitch bend plates, detachable thumb hook, FN, voice button, USB-C, PHONES, OUTPUT, power switch, water drain.
- Octave system: eight touch-sensitive rollers; the position between two textured rollers indicates standard pitch; sliding the thumb changes among seven octave ranges.
- Performance modes: Easy Mode, Pro Mode, Max Mode.
- Articulations: asterisk key 1 triggers Articulation 1, asterisk key 2 triggers Articulation 2, both together trigger Articulation 3; FN combinations can hold articulations.

## Saxophone Mode Rules

Manual pages 63-64 state:

- LP1 works as `+1 semi` only when playing C or G.
- Asterisk key 1 is inactive by default.
- Asterisk key 2 works as `+1 semi` across notes unless reassigned.
- RP2 works as `-1 semi` only when playing C while LP2 is pressed.
- RP1 works as `+1 semi` only when playing D.
- Bis works as `-1 semi` only when playing B.
- Use the voice command `Pro Mode`, or select Pro Mode during the initial voice tutorial and switch fingering mode to Saxophone, to reset side and pinky key defaults.

## Data Transcription Requirements

Every PRO C20 fingering entry must record:

- `mode`
- `group`
- `note`
- `pressed`
- optional `variants`
- optional `octaveRange`
- Korean teaching tip
- source metadata: manual page, PDF page, heading, row/column labels where available
- verification status

## Collision Risks With Existing Mini App

- Existing `src/data/keys.ts` defines `KeyId` for Clarii mini only. PRO C20 must define `ProC20KeyId`.
- Existing `src/data/fingerings.json`, `src/data/notes.ts`, and `src/utils/grading.ts` must remain mini-specific.
- Existing `LessonPlayer` and `TryCard` assume mini note/layer data. PRO C20 gets separate lesson components.
- Existing mini progress IDs (`L0` etc.) must not mix with PRO C20 IDs (`P20-L0` etc.).
