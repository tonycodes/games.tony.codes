export const ROUTE = [
  [0, 80], [0, 40], [0, 0], [0, -40], [0, -80],
  [40, -120], [80, -120], [120, -120], [160, -120],
  [200, -80], [200, -40], [200, 0], [200, 40], [200, 80],
  [160, 120], [120, 120], [80, 120], [40, 80],
  [40, 40], [80, 0], [120, -20], [160, -20],
  [160, 20], [120, 60], [80, 60],
];

export const STOPS = [
  { i: 0, n: 'Elm St Depot' },
  { i: 4, n: 'Hillcrest Ave' },
  { i: 8, n: 'Central Station' },
  { i: 11, n: 'Greenfield Park' },
  { i: 14, n: 'Market Square' },
  { i: 18, n: 'River Bridge' },
  { i: 21, n: 'Sunset Blvd' },
  { i: 24, n: 'Terminal' },
];

export function newPax() {
  var p = [];
  for (var i = 0; i < STOPS.length - 1; i++) {
    var c = 1 + Math.floor(Math.random() * 3);
    for (var j = 0; j < c; j++) {
      var d = i + 1 + Math.floor(Math.random() * (STOPS.length - i - 1));
      p.push({ origin: i, dest: Math.min(d, STOPS.length - 1), on: false, done: false });
    }
  }
  return p;
}
