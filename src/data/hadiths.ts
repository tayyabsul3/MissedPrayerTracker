export interface Hadith {
  id: string;
  arabic?: string;
  text: string;
  source: string;
  category: 'warning' | 'reminder';
}

export const HADITHS: Hadith[] = [
  {
    id: 'w1',
    arabic: 'إِنَّ بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكَ الصَّلَاةِ',
    text: 'Verily, between a man and shirk (polytheism) and kufr (disbelief) is the abandonment of prayer.',
    source: 'Sahih Muslim 82',
    category: 'warning',
  },
  {
    id: 'w2',
    arabic: 'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ',
    text: 'The first thing for which a person will be brought to account on the Day of Judgment from his deeds is his prayer. If it is good, then he will have succeeded and fallen short; if it is bad, then he will have failed and lost.',
    source: 'Sunan at-Tirmidhi 413',
    category: 'warning',
  },
  {
    id: 'w3',
    arabic: 'الْعَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ',
    text: 'The covenant that stands between us and them is the prayer; whoever abandons it has committed disbelief.',
    source: 'Sunan an-Nasa\'i 463',
    category: 'warning',
  },
  {
    id: 'w4',
    arabic: 'لاَ تَتْرُكِ الصَّلاَةَ مُتَعَمِّدًا، فَإِنَّ مَنْ تَرَكَ الصَّلاَةَ مُتَعَمِّدًا فَقَدْ بَرِئَتْ مِنْهُ ذِمَّةُ اللَّهِ',
    text: 'Do not leave any obligatory prayer intentionally, for whoever leaves an obligatory prayer intentionally, then the protection and covenant of Allah is withdrawn from him.',
    source: 'Musnad Ahmad (Authenticated by Al-Albani)',
    category: 'warning',
  },
  {
    id: 'r1',
    arabic: 'مَنْ نَسِيَ صَلاَةً أَوْ نَامَ عَنْهَا فَكَفَّارَتُهَا أَنْ يُصَلِّيَهَا إِذَا ذَكَرَهَا',
    text: 'Whoever forgets a prayer or sleeps through it, its expiation is that he prays it when he remembers it. There is no other expiation for it.',
    source: 'Sahih al-Bukhari 597, Sahih Muslim 684',
    category: 'reminder',
  },
  {
    id: 'r2',
    arabic: 'اسْتَقِيمُوا وَلَنْ تُحْصُوا وَاعْلَمُوا أَنَّ خَيْرَ أَعْمَالِكُمُ الصَّلَاةُ',
    text: 'Adhere to the straight path, though you will not be able to do so perfectly; and know that the best of all your deeds is the prayer.',
    source: 'Sunan Ibn Majah 277',
    category: 'reminder',
  },
  {
    id: 'r3',
    arabic: 'يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلاَ أُبَالِي',
    text: 'Allah the Almighty says: "O son of Adam, so long as you call upon Me and ask of Me, I shall forgive you for what you have done, and I shall not mind..."',
    source: 'Hadith Qudsi, Sunan at-Tirmidhi 3540',
    category: 'reminder',
  },
  {
    id: 'r4',
    arabic: 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكْثِرُوا الدُّعَاءَ',
    text: 'The nearest a servant comes to his Lord is when he is prostrating himself, so make abundant supplication (in this state).',
    source: 'Sahih Muslim 482',
    category: 'reminder',
  },
  {
    id: 'w5',
    arabic: 'الَّذِي تَفُوتُهُ صَلاَةُ الْعَصْرِ كَأَنَّمَا وُتِرَ أَهْلَهُ وَمَالَهُ',
    text: 'Whoever misses the Asr prayer (intentionally), it is as if he lost his family and property.',
    source: 'Sahih al-Bukhari 552',
    category: 'warning',
  },
  {
    id: 'w6',
    arabic: 'مَنْ تَرَكَ صَلاَةَ الْعَصْرِ فَقَدْ حَبِطَ عَمَلُهُ',
    text: 'He who abandons the Asr prayer, his good deeds (of that day) will become void.',
    source: 'Sahih al-Bukhari 553',
    category: 'warning',
  },
  {
    id: 'r5',
    arabic: 'مَثَلُ الصَّلَوَاتِ الْخَمْسِ كَمَثَلِ نَهَرٍ جَارٍ غَمْرٍ عَلَى بَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ',
    text: 'The likeness of the five daily prayers is as a deep running river at the door of one of you, in which he washes five times a day. (Would any dirt remain on him?)',
    source: 'Sahih Muslim 668, Sahih al-Bukhari 528',
    category: 'reminder',
  },
  {
    id: 'r6',
    arabic: 'الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَاتٌ لِمَا بَيْنَهُنَّ مَا اجْتُنِبَتِ الْكَبَائِرُ',
    text: 'The five daily prayers, and from one Friday prayer to the next, is an expiation for whatever sins are committed between them, so long as major sins are avoided.',
    source: 'Sahih Muslim 233',
    category: 'reminder',
  },
];

export const getRandomHadith = (category?: 'warning' | 'reminder'): Hadith => {
  const filtered = category ? HADITHS.filter((h) => h.category === category) : HADITHS;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};
