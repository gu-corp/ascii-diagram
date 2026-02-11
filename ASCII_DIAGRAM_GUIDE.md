# ASCII Diagram Creation Guide (for AI)

This guide describes the rules for creating ASCII diagrams that render correctly with the `ascii-diagram` library.

[日本語版はこちら](./ASCII_DIAGRAM_GUIDE.ja.md)

## Basic Rules

### 1. Character Width Calculation

| Character Type | Width | Examples |
|---------------|-------|----------|
| Half-width alphanumeric/symbols | 1 | `A`, `1`, `-`, `│` |
| Full-width Japanese/symbols | 2 | `あ`, `漢`, `（`, `）` |
| Box drawing characters | 1 | `┌`, `─`, `┐`, `│`, `└`, `┘` |
| Arrows | 1 | `→`, `←`, `↑`, `↓`, `▼`, `▲` |

### 2. Consistent Line Width (Important)

**All lines must have the same width (column count).**

```
Good example (all lines width=20):
┌──────────────────┐
│  Test            │
└──────────────────┘

Bad example (different widths per line):
┌──────────────────┐
│  Test│
└──────────────────┘
```

### 3. Available Box Drawing Characters

```
Corners:    ┌ ┐ └ ┘
Lines:      ─ │
T-junctions: ├ ┤ ┬ ┴
Cross:      ┼
Double-line: ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬
```

### 4. Arrow Characters

```
Directional arrows: → ← ↑ ↓
Triangle arrows:    ▶ ◀ ▲ ▼
```

Arrows are rendered in green.

## Diagram Structure Patterns

### Simple Box

```
┌─────────┐
│ Content │
└─────────┘
```

### Box with Header

```
┌─────────────────┐
│     Title       │
├─────────────────┤
│  Body content   │
└─────────────────┘
```

### Nested Boxes

```
┌─────────────────────┐
│  Outer             │
│  ┌───────────┐     │
│  │  Inner    │     │
│  └───────────┘     │
└─────────────────────┘
```

### Vertical Flowchart

```
┌─────────┐
│ Step 1  │
└────┬────┘
     │
     ▼
┌─────────┐
│ Step 2  │
└─────────┘
```

### Branching Flow

```
         ┌─────────┐
         │  Check  │
         └────┬────┘
              │
     ┌────────┼────────┐
     ▼        │        ▼
┌────────┐   │   ┌────────┐
│  Yes   │   │   │   No   │
└────────┘   │   └────────┘
```

## Width Calculation Tips

### Calculation Example

```
│  G.U.Exchange (Payment)  │
```

Breakdown:
- `│` = 1
- 2 spaces = 2
- `G.U.Exchange` = 12 (12 half-width characters)
- ` ` = 1 (space)
- `(Payment)` = 9 (9 half-width characters)
- 2 spaces = 2
- `│` = 1
- **Total = 28**

### Right Padding

Pad shorter text lines with spaces to align the width:

```
│  Short text                           │  ← pad with spaces
│  Longer text that fills the box      │
```

## Checklist

After creating a diagram, verify:

- [ ] All lines have the same width
- [ ] Box corners are properly closed
- [ ] Vertical lines align top to bottom
- [ ] Full-width/half-width width calculation is correct
- [ ] Nested boxes are properly aligned

## Common Mistakes

### 1. Parentheses Width

```
Wrong: │ (test) │  ← mixing with half-width parentheses
Right: │（test）│  ← full-width parentheses have width 2
```

### 2. Vertical Line Position

```
Wrong:
│  Text│        ← inner box
│  Text  │      ← outer box (misaligned)

Right:
│  Text  │      ← inner box
│  Text  │      ← outer box (aligned)
```

### 3. Vertical Line Continuity

Vertical lines must be in the same column position across rows:

```
│       │
│       │  ← same column position
│       ▼
```
