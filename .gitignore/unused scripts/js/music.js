/* ================================================================
   music.js — Cole suas playlists aqui!

   1. Coloca sua YouTube Data API key em YOUTUBE_API_KEY
      (grátis — veja como conseguir em: https://console.cloud.google.com)

   2. Adicione suas playlists em MUSIC_CONFIG:
      - name:    nome da playlist (opcional, padrão: "Playlist 1", etc.)
      - id:      link ou ID da playlist do YouTube
      - artwork: URL da capa (opcional)

   Só isso! As músicas são carregadas automaticamente da playlist.
   ================================================================ */

const YOUTUBE_API_KEY = 'AIzaSyA_V9OT-oGhrIFZ_Aw4pXd-q42SjLlroBc';

const MUSIC_CONFIG = [
  {
    name:    'Goreshit - Goretrance X',
    id:      'PLWNnDaCwqE9dKVwWTxp2ffG-ybluUHPcL',
    artwork: 'https://t2.genius.com/unsafe/258x258/https%3A%2F%2Fimages.genius.com%2F1cb7d61a20f8eb19443037ebb567c30a.1000x1000x1.jpg'
  },
  {
    name:    'Goreshit - Goretrance 9',
    id:      'PLWNnDaCwqE9fO6KAfkY0XfiXDn3d3I-uu',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/86be2b7047500305f11dce2a2cf97495/500x500.jpg'
  },
  {
    name:    'Goreshit - Tomboyish love for soda pop and apple sweets digipak',
    id:      'PLWNnDaCwqE9cq91umpDvl9MmGNx8fX_GL',
    artwork: 'https://f4.bcbits.com/img/a3701148892_10.jpg'
  },
  {
    name:    'Rory in early 20s - Denki no iryoku',
    id:      'PLWWOCZb-xyVwrfv0EMByod_rfL1GXsRE7',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/1b0a38eeaaa21be3bfff793764f641d8/500x500-000000-80-0-0.jpg'
  },
  {
    name:    'Rory in early 20s - Shinda warutsu',
    id:      'PLWWOCZb-xyVygbEz0waClxIsbgw5c2ouW',
    artwork: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDA40dAe0KhO30nzY34y7IHu6DEp-Ho9kUnL6nZl5GsTq0KDHxABBYE_Lxqdsq6ZhtqrCcYg&s'
  },
  {
    name:    'Rory in early 20s - Mudarashi',
    id:      'PLWWOCZb-xyVyFxZdwT-eITrJ2ziQx7yJ8',
    artwork: 'https://cdn-images.dzcdn.net/images/cover/8901bfbb90db2f7f827e6c54eb3dd4a2/500x500-000000-80-0-0.jpg'
  },
  {
    name:    'Weezer -  Everything Will Be Alright in the End',
    id:      'PLUtZtdQrxrZiYe1upMC5xfxWASouv8Odz',
    artwork: 'https://www.vagalume.com.br/weezer/discografia/everything-will-be-alright-in-the-end.webp'
  },
  {
    name:    'Weezer -  Green Album',
    id:      'PL81_CtYCym2-YiyvBbhCbHgLlJBzshSDS',
    artwork: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBcB16Y8G4s_sNG_6Xynz1lo4C0VF12axcAw&s'
  },
  {
    name:    'Weezer -  Raditude',
    id:      'PLHTo__bpnlYUmx9PMpZLkFmkSMShTa62m',
    artwork: 'https://www.vagalume.com.br/weezer/discografia/raditude.webp'
  },
  {
    name:    'Weezer -  Pinkerton',
    id:      'PLDUEjoBVMbh8ip9i96UBkZLPyAhbZEcDc',
    artwork: 'https://upload.wikimedia.org/wikipedia/pt/8/84/Pinkerton.jpg?20120506020958'
  }
];
