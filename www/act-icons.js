/* Baby Mo — modern two-tone symbols for the du'a scene's tap button (replacing emoji), one per du'a,
   keyed by du'a id (daily + Ramadan series). 48×48, flat and rounded, drawn the same on every phone. */
(function () {
  "use strict";
  var W = "#FFFFFF";
  function s(inner) { return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + inner + "</svg>"; }
  /* a footprint: sole + five toes, big toe on the inside; right = mirrored by hand (no transform) */
  var foot = function (c, right) {
    var X = function (x) { return right ? 48 - x : x; };
    return '<path d="M' + X(22) + ' 43c-5.6 0-9.4-4.2-9-10 .5-7.6 3-15.6 9.6-15.6 6.4 0 8.4 7.4 7.8 14.4C30 38.8 27.4 43 22 43z" fill="' + c + '"/>' +
      '<ellipse cx="' + X(14.6) + '" cy="11.6" rx="3.6" ry="4.2" fill="' + c + '"/><circle cx="' + X(21.2) + '" cy="8.6" r="3" fill="' + c + '"/>' +
      '<circle cx="' + X(26.6) + '" cy="10" r="2.6" fill="' + c + '"/><circle cx="' + X(30.6) + '" cy="13.4" r="2.3" fill="' + c + '"/><circle cx="' + X(33) + '" cy="17.8" r="2" fill="' + c + '"/>';
  };
  var lantern = function (a, b) {
    return '<path d="M24 5v4" stroke="' + b + '" stroke-width="2.6" stroke-linecap="round"/><path d="M18 10h12l-1.5 3h-9z" fill="' + b + '"/>' +
      '<path d="M16.5 14h15c1.2 6 1.2 13 0 19h-15c-1.2-6-1.2-13 0-19z" fill="' + a + '"/><path d="M21 17c-.7 4-.7 9 0 13M27 17c.7 4 .7 9 0 13" stroke="' + W + '" stroke-width="1.6" opacity=".55" fill="none"/>' +
      '<ellipse cx="24" cy="23.5" rx="3" ry="4.2" fill="#FFF3B0"/><path d="M18.5 33h11l-1.5 4h-8z" fill="' + b + '"/>';
  };
  var drum = function () {
    return '<ellipse cx="24" cy="16" rx="14" ry="5.4" fill="#F4D3A0"/><path d="M10 16v14c0 3 6.3 5.6 14 5.6S38 33 38 30V16c0 3-6.3 5.4-14 5.4S10 19 10 16z" fill="#C7692C"/>' +
      '<path d="M14 23.5v8M19 25v8.4M24 25.4v8.6M29 25v8.4M34 23.5v8" stroke="#8E4415" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M34 3.5l-5.5 10" stroke="#8E4415" stroke-width="3" stroke-linecap="round"/><circle cx="34.5" cy="3.6" r="2.8" fill="#FFB547"/>';
  };
  var I = {
    // ── daily ──
    wakeup: s('<circle cx="24" cy="26" r="13" fill="#FF8A3D"/><circle cx="24" cy="26" r="9.6" fill="' + W + '"/><path d="M24 20v6.4l4 2.4" stroke="#FF8A3D" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
      '<circle cx="12.5" cy="12.5" r="4.6" fill="#FFC23A"/><circle cx="35.5" cy="12.5" r="4.6" fill="#FFC23A"/><path d="M15 39l-2.4 3.4M33 39l2.4 3.4" stroke="#FF8A3D" stroke-width="3" stroke-linecap="round"/>'),
    bathroom_in: s(foot("#3B8CF0")),
    bathroom_out: s(foot("#22AE5F", true)),
    leave_home: s('<rect x="12" y="13" width="24" height="27" rx="8" fill="#16A3A0"/><path d="M18 13v-2.4a6 6 0 0 1 12 0V13" stroke="#0E7C7A" stroke-width="3" fill="none"/>' +
      '<rect x="16.5" y="25" width="15" height="10" rx="3.5" fill="#7FE0D6"/><path d="M21 29h6" stroke="#0E7C7A" stroke-width="2.4" stroke-linecap="round"/>'),
    vehicle: s('<path d="M8 28l3.5-8.6A5 5 0 0 1 16.2 16h15.6a5 5 0 0 1 4.7 3.4L40 28v7a2 2 0 0 1-2 2h-2.5a2 2 0 0 1-2-2v-1.4h-19V35a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill="#3B8CF0"/>' +
      '<path d="M14.2 25.6l2.6-6.2h14.4l2.6 6.2z" fill="' + W + '" opacity=".9"/><circle cx="15" cy="30.6" r="2.5" fill="#FFC23A"/><circle cx="33" cy="30.6" r="2.5" fill="#FFC23A"/>'),
    study: s('<path d="M24 14c-4-3-10-3.6-15-2.4v24c5-1.2 11-.6 15 2.4 4-3 10-3.6 15-2.4v-24c-5-1.2-11-.6-15 2.4z" fill="#3B8CF0"/>' +
      '<path d="M24 14v24" stroke="#1F62C2" stroke-width="2.2"/><path d="M13 18c3-.5 6-.2 8 .9M13 23c3-.5 6-.2 8 .9M27 18.9c2-1.1 5-1.4 8-.9M27 23.9c2-1.1 5-1.4 8-.9" stroke="' + W + '" stroke-width="2" stroke-linecap="round" opacity=".85"/>'),
    eating: s('<ellipse cx="24" cy="13.5" rx="6.6" ry="8.6" fill="#FF8A3D"/><ellipse cx="22.2" cy="11.5" rx="2" ry="3.2" fill="' + W + '" opacity=".55"/><rect x="21.6" y="20" width="4.8" height="22" rx="2.4" fill="#E86A2A"/>'),
    after_eat: s('<path d="M8 22h32c0 9-7.2 15.5-16 15.5S8 31 8 22z" fill="#FF8A3D"/><rect x="6" y="19.5" width="36" height="4.6" rx="2.3" fill="#E86A2A"/>' +
      '<path d="M17 28.5l4.2 4.2 8.4-8.4" stroke="' + W + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M34 6l1.2 2.8 2.8 1.2-2.8 1.2L34 14l-1.2-2.8L30 10l2.8-1.2z" fill="#FFC23A"/>'),
    rain: s('<path d="M6 25C6 15 14.1 8 24 8s18 7 18 17c-2-2.2-4.6-2.2-6 0-1.6-2.2-4.4-2.2-6 0-1.6-2.2-4.4-2.2-6 0-1.6-2.2-4.4-2.2-6 0-1.4-2.2-4-2.2-6 0z" fill="#8B5CF6"/>' +
      '<path d="M24 25v12.5a3.5 3.5 0 0 1-7 0" stroke="#5B3BC4" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M24 5v3" stroke="#5B3BC4" stroke-width="3" stroke-linecap="round"/>'),
    enter_home: s('<path d="M12 41V12a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v29z" fill="#E8812F"/><rect x="16.5" y="12.5" width="15" height="12" rx="2.5" fill="#FFC27A"/><rect x="16.5" y="27" width="15" height="9.5" rx="2.5" fill="#FFC27A"/>' +
      '<circle cx="29" cy="31.5" r="1.7" fill="#7A3B0E"/><path d="M8 41h32" stroke="#B85C1A" stroke-width="3" stroke-linecap="round"/>'),
    evening_dhikr: s('<path d="M7 33h34a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4z" fill="#C2410C"/><path d="M12 31a12 12 0 0 1 24 0z" fill="#FF8A3D"/><path d="M16 31a8 8 0 0 1 16 0z" fill="#FFC23A"/>' +
      '<path d="M24 7v5M11.5 13l3.2 3.2M36.5 13l-3.2 3.2" stroke="#FF6F7A" stroke-width="3" stroke-linecap="round"/><path d="M38 6l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" fill="#B794F6"/>'),
    parents: s('<path d="M24 41S7 31 7 19.5A8.5 8.5 0 0 1 24 14a8.5 8.5 0 0 1 17 5.5C41 31 24 41 24 41z" fill="#FF6F9A"/><path d="M14.5 18a4.2 4.2 0 0 1 4-3.6" stroke="' + W + '" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/>'),
    bedtime_tasbih: '<img src="icons/scene/tasbih-v2.svg" alt="" draggable="false">',
    sleep: s('<path d="M24 5.5a12.5 12.5 0 0 0-7.4 22.6c1.3 1 2 2.3 2 3.9V34h10.8v-2c0-1.6.7-2.9 2-3.9A12.5 12.5 0 0 0 24 5.5z" fill="#FFC23A"/><path d="M19.8 13.5a6.4 6.4 0 0 1 4.6-2.6" stroke="' + W + '" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<rect x="18.6" y="35.5" width="10.8" height="3.8" rx="1.9" fill="#8B7CF0"/><rect x="20" y="40.5" width="8" height="3.6" rx="1.8" fill="#8B7CF0"/>'),
    // ── Ramadan series ──
    r_hilal: s('<path d="M30 7.5A16.5 16.5 0 1 0 40 36.5 13.6 13.6 0 0 1 30 7.5z" fill="#FFC23A"/><path d="M38 10l1.1 2.6 2.6 1.1-2.6 1.1L38 17.4l-1.1-2.6-2.6-1.1 2.6-1.1z" fill="#8B7CF0"/>'),
    r_niat: s(lantern("#FF8A3D", "#B85C1A")),
    r_shaim: s('<circle cx="24" cy="24" r="16" fill="#FFC23A"/><path d="M16.5 21.5q2.3-2.6 4.6 0M26.9 21.5q2.3-2.6 4.6 0" stroke="#8A4B0E" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M17.5 28q6.5 5.6 13 0" stroke="#8A4B0E" stroke-width="2.8" stroke-linecap="round" fill="none"/><circle cx="15" cy="27" r="2.4" fill="#FF8A8A" opacity=".55"/><circle cx="33" cy="27" r="2.4" fill="#FF8A8A" opacity=".55"/>'),
    r_buka: s(drum()),
    r_after: s('<path d="M27 15h12l-1.6 25.5a2.4 2.4 0 0 1-2.4 2.2h-4a2.4 2.4 0 0 1-2.4-2.2z" fill="#9FD3FF"/><path d="M27.8 25h10.4l-.9 15a1.6 1.6 0 0 1-1.6 1.5h-5.4a1.6 1.6 0 0 1-1.6-1.5z" fill="#3B8CF0"/>' +
      '<ellipse cx="15.5" cy="27" rx="7" ry="10.5" transform="rotate(-18 15.5 27)" fill="#8E4415"/><ellipse cx="13.6" cy="23.5" rx="2" ry="4" transform="rotate(-18 13.6 23.5)" fill="#C7692C"/>'),
    r_host: s('<path d="M24 41S7 31 7 19.5A8.5 8.5 0 0 1 24 14a8.5 8.5 0 0 1 17 5.5C41 31 24 41 24 41z" fill="#FFB020"/><path d="M14.5 18a4.2 4.2 0 0 1 4-3.6" stroke="' + W + '" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/>'),
    r_witr: s(lantern("#8B5CF6", "#5B3BC4")),
    r_qadr: s('<path d="M22 8l2.6 7.4L32 18l-7.4 2.6L22 28l-2.6-7.4L12 18l7.4-2.6z" fill="#FFC23A"/><path d="M35 25l1.6 4.4L41 31l-4.4 1.6L35 37l-1.6-4.4L29 31l4.4-1.6z" fill="#8B7CF0"/><path d="M14 31l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1z" fill="#FF8A3D"/>'),
    r_zakat: s('<path d="M14 18c0-3 3-5 10-5s10 2 10 5l3 17a5 5 0 0 1-5 6H16a5 5 0 0 1-5-6z" fill="#E7C27A"/><path d="M15 18h18" stroke="#B4893A" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M24 22v13M20.5 26.5q3.5 1.5 3.5 4.5M27.5 26.5q-3.5 1.5-3.5 4.5M20.5 31.5q3.5 1.5 3.5 4M27.5 31.5q-3.5 1.5-3.5 4" stroke="#8E6A1E" stroke-width="2" stroke-linecap="round" fill="none"/>'),
    r_eid_greet: s('<path d="M24 6l16 18-16 18L8 24z" fill="#22AE5F"/><path d="M24 6l16 18-16 18L8 24z" fill="none" stroke="#147A40" stroke-width="2"/>' +
      '<path d="M16 16l16 16M32 16L16 32M20 12l16 16M28 12L12 28M28 36l8-8M20 36l-8-8" stroke="#BFF0C9" stroke-width="2" opacity=".75"/><path d="M24 6c2-3 5-3.6 7-2" stroke="#147A40" stroke-width="2.4" stroke-linecap="round" fill="none"/>'),
    r_takbir: s(drum())
  };
  window.ACT_ICON = I;
})();
