# Platform marks

`playstation.svg`, `xbox.svg` and `nintendo.svg` are the official brand marks,
downloaded from [Simple Icons](https://simpleicons.org) (MIT licensed set) via
`cdn.jsdelivr.net/npm/simple-icons`. `pc.svg` is ours — PC has no vendor, so it
is a monitor drawn at the same weight as the others.

They are here as the files the paths came from. The component that renders them,
`src/app/components/header/atoms/PlatformMark.tsx`, inlines the same paths so the
icon inherits `currentColor` and follows the theme.

The marks say which machine a key is for. They are not a badge of endorsement,
and each trademark remains its owner's.
