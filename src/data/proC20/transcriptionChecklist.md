# PRO C20 Fingering Chart Transcription Checklist

The current app includes panel-verified controller drills and mode scaffolds. Exact note fingerings from the Appendix charts still require visual transcription from the PDF.

## Status

| Mode | Status | Source |
|---|---|---|
| ROBKOO Sax | partial | Manual pages 61-63 |
| EWI | partial | Manual page 61 |
| Saxophone | partial | Manual pages 63-64 |
| ROBKOO Dizi | planned | Manual pages 65-66 |
| ROBKOO Hulusi | planned | Manual pages 65-66 |
| Dizi | planned | Manual page 66 |
| Hulusi | planned | Manual page 66 |
| EWI(F) | planned | Manual page 67 |
| EVI | planned | Manual page 67 |
| Whistle | planned | Manual pages 67-68 |

## Required Manual Review

- Open `Clarii_PRO_C20_User_s_Manual_EN_V3.1.pdf`.
- Visually inspect Appendix `Fingering Charts`, manual pages 61-68.
- For each chart row, record pressed physical keys, octave range if applicable, variants, and source page metadata.
- Do not use OCR-only output as final truth because chart symbols and note diagrams may be lost.

## Entry Requirements

- Stable `id`
- `mode`
- `group`
- `note`
- `pressed`
- optional `variants`
- Korean `tipKor`
- `source.manualPage`
- `source.pdfPage`
- `source.heading`
- `verification`
