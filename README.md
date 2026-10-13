# Shubh weds Ayushi: wedding invitation

A scroll-animated, Jaipur-themed wedding invitation website. It opens with a wax-sealed envelope addressed to the
guest; tapping the seal (or waiting 5 seconds) opens it into the invitation.

## Run it

Needs [Node.js](https://nodejs.org) (any recent version). No other packages are needed to run or build the site.

```bash
npm start          # builds index.html, serves on http://localhost:3000
npm run dev        # same, but rebuilds on every page load while you edit src/sections
npm run build      # only rebuild index.html (and the phone stylesheets in css/m/)
```

**Personal invitation links:** add `?to=` with the guest's name, e.g. `http://localhost:3000/?to=Rahul%20Sharma`.
The name appears on the envelope, the header, the gate page, the RSVP card and the closing note.

## Publish

`index.html` and `css/m/` are already built and committed, so the folder works as it is on any static host (Vercel,
Netlify, GitHub Pages) or with `npm start` on a Node host. `vercel.json` is set up for Vercel.
After editing anything in `src/` or `css/`, run `npm run build` and commit the result.

## Change the wedding details

Most details are in **`js/config.js`**: the default guest text, the countdown date and time, the venue and city, the
people guests can call, and the first wishes on the Wishing Wall. Names, events and other text are in the section
files under `src/sections/`.

## Where things are

| Path | What |
|---|---|
| `js/config.js` | **Wedding details** (see above) |
| `src/index.html` | Page shell (head, fonts, styles, scripts); includes the sections below |
| `src/sections/00-opening.html` | The opening: wax-sealed envelope over Hawa Mahal, "Welcome to Jaipur" |
| `src/sections/01-hero.html` | Page 1: Hawa Mahal header |
| `src/sections/02-gate.html` | Road strip + page 2: gate with guest name, invitation, names, countdown, venue |
| `src/sections/03-events.html` | Page 3: events wall and the event cards |
| `src/sections/04-patrika.html` | Cloud band + page 4: Patrika Gate and the couple |
| `src/sections/05-family.html` | Page 5: Meet the Bride & Groom Family |
| `src/sections/05b-couple.html` | Meet the Bride & Groom: photo runway with the paper plane |
| `src/sections/06-rsvp.html` | Page 6: RSVP |
| `src/sections/07-end.html` | Page 7: Wishing Wall |
| `src/sections/08-garden.html` | Contacts, venue, save the date, note from the couple, Amer Fort |
| `css/*.css` | One stylesheet per section; `mobile.css` holds the phone-only layout (screens up to 767 px wide) |
| `css/m/` | Built automatically: phone copies of the stylesheets that use the smaller pictures. Do not edit |
| `js/*.js` | One script per feature (opening, hero, gate, road, events, patrika, family, runway, rsvp, wishes, ...) |
| `js/perf.js` | Phone performance settings (all tweakable values in `CFG` at the top) |
| `assets/img/` | All pictures; `assets/img/m/` holds smaller copies used on phones |
| `scripts/build.js` | Joins `src/index.html` + `src/sections/*` into `index.html` and builds `css/m/` |
| `scripts/mobile-images.py` | Makes the phone copies in `assets/img/m/` (needs Python with Pillow) |
| `server.js` | Node server (serves only the public files) |

## Replacing a picture

Replace the file in `assets/img/` with the same name. If that picture also has a phone copy in `assets/img/m/`,
run `python scripts/mobile-images.py` (needs Python and `pip install pillow`), then `npm run build`.

## Phones

Phones get their own layout (`css/mobile.css`), smaller pictures, and a lighter set of effects so scrolling stays
smooth; laptops and desktops are not affected. Adding `?perf=lite` to the address forces the lightest phone mode,
`?perf=full` the normal one. For testing: `#op-skip` skips the opening.

`npm run check:mobile` takes screenshots at several screen sizes (needs `npm install` and Google Chrome).
