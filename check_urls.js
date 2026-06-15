const http = require('https');

const reciters = [
  { id: 'afs', url: 'https://server8.mp3quran.net/afs/001.mp3' },
  { id: 'basit', url: 'https://server7.mp3quran.net/basit/001.mp3' },
  { id: 'husr', url: 'https://server13.mp3quran.net/husr/001.mp3' },
  { id: 's_gmd', url: 'https://server7.mp3quran.net/s_gmd/001.mp3' },
  { id: 'shatri', url: 'https://server11.mp3quran.net/shatri/001.mp3' },
  { id: 'yasser', url: 'https://server11.mp3quran.net/yasser/001.mp3' },
  { id: 'maher', url: 'https://server12.mp3quran.net/maher/001.mp3' },
  { id: 'a_jbr', url: 'https://server11.mp3quran.net/a_jbr/001.mp3' },
  { id: 'frs_a', url: 'https://server8.mp3quran.net/frs_a/001.mp3' },
  { id: 'ajm', url: 'https://server10.mp3quran.net/ajm/001.mp3' },
  { id: 'sds', url: 'https://server11.mp3quran.net/sds/001.mp3' },
  { id: 'shur', url: 'https://server7.mp3quran.net/shur/001.mp3' }
];

async function checkUrl(r) {
  return new Promise((resolve) => {
    http.request(r.url, { method: 'HEAD' }, (res) => {
      resolve({ id: r.id, status: res.statusCode, url: r.url });
    }).on('error', () => {
      resolve({ id: r.id, status: 'error', url: r.url });
    }).end();
  });
}

Promise.all(reciters.map(checkUrl)).then(console.log);
