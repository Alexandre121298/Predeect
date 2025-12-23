import Papa from 'papaparse';

class LotoService {
  constructor() {
    this.drawDays = [1, 3, 6]; // Lundi, Mercredi, Samedi
  }

  generateRandomDraw() {
    const numbers = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);
    
    const chance = Math.floor(Math.random() * 10) + 1;
    
    return {
      id: Date.now(),
      date: this.getNextDrawDate(),
      numbers,
      chance,
      timestamp: new Date().toISOString()
    };
  }

  getNextDrawDate() {
    const today = new Date();
    const day = today.getDay();
    
    let daysToAdd = 1;
    for (let i = 1; i <= 7; i++) {
      const nextDay = (day + i) % 7;
      if (this.drawDays.includes(nextDay)) {
        daysToAdd = i;
        break;
      }
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate.toLocaleDateString('fr-FR');
  }

  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          try {
            const draws = this.transformCSVData(results.data, results.meta.fields);
            resolve(draws);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  detectCSVFormat(headers) {
    const headerStr = headers.join('|').toLowerCase();
    
    const modernFormats = [
      {
        name: 'modern_v1',
        test: () => headerStr.includes('date_de_tirage') || headerStr.includes('date de tirage'),
        mapping: {
          date: ['date_de_tirage', 'date de tirage', 'date_tirage', 'date'],
          ball1: ['boule_1', 'boule 1', 'n1', 'numero_1'],
          ball2: ['boule_2', 'boule 2', 'n2', 'numero_2'],
          ball3: ['boule_3', 'boule 3', 'n3', 'numero_3'],
          ball4: ['boule_4', 'boule 4', 'n4', 'numero_4'],
          ball5: ['boule_5', 'boule 5', 'n5', 'numero_5'],
          chance: ['numero_chance', 'numero chance', 'numéro chance', 'nc', 'chance', 'n_chance']
        }
      },
      {
        name: 'modern_v2',
        test: () => headerStr.includes('annee_numero_de_tirage') || headerStr.includes('année'),
        mapping: {
          date: ['date_de_tirage', 'date de tirage', 'date', 'jour_de_tirage'],
          ball1: ['boule_1', 'n1', 'numero_1', 'numero 1'],
          ball2: ['boule_2', 'n2', 'numero_2', 'numero 2'],
          ball3: ['boule_3', 'n3', 'numero_3', 'numero 3'],
          ball4: ['boule_4', 'n4', 'numero_4', 'numero 4'],
          ball5: ['boule_5', 'n5', 'numero_5', 'numero 5'],
          chance: ['numero_chance', 'n_chance', 'chance', 'numero chance']
        }
      },
      {
        name: 'simple',
        test: () => headerStr.includes('date') && (headerStr.includes('n1') || headerStr.includes('numero')),
        mapping: {
          date: ['date', 'date_tirage', 'jour'],
          ball1: ['n1', 'numero1', 'numero_1', 'boule1'],
          ball2: ['n2', 'numero2', 'numero_2', 'boule2'],
          ball3: ['n3', 'numero3', 'numero_3', 'boule3'],
          ball4: ['n4', 'numero4', 'numero_4', 'boule4'],
          ball5: ['n5', 'numero5', 'numero_5', 'boule5'],
          chance: ['nc', 'chance', 'numero_chance', 'n_chance']
        }
      }
    ];

    for (const format of modernFormats) {
      if (format.test()) {
        return format;
      }
    }

    return modernFormats[0];
  }

  findColumnValue(row, possibleNames) {
    for (const name of possibleNames) {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '_');
      
      for (const key in row) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
        if (normalizedKey === normalizedName || normalizedKey.includes(normalizedName)) {
          return row[key];
        }
      }
    }
    return null;
  }

  transformCSVData(data, headers) {
    console.log('Headers détectés:', headers);
    
    const format = this.detectCSVFormat(headers);
    console.log('Format détecté:', format.name);

    const draws = [];

    for (const row of data) {
      try {
        const dateStr = this.findColumnValue(row, format.mapping.date);
        const ball1 = this.findColumnValue(row, format.mapping.ball1);
        const ball2 = this.findColumnValue(row, format.mapping.ball2);
        const ball3 = this.findColumnValue(row, format.mapping.ball3);
        const ball4 = this.findColumnValue(row, format.mapping.ball4);
        const ball5 = this.findColumnValue(row, format.mapping.ball5);
        const chance = this.findColumnValue(row, format.mapping.chance);

        const numbers = [ball1, ball2, ball3, ball4, ball5]
          .map(n => {
            if (typeof n === 'string') {
              return parseInt(n.trim());
            }
            return parseInt(n);
          })
          .filter(n => !isNaN(n) && n >= 1 && n <= 49);

        const chanceNum = parseInt(chance);

        if (numbers.length === 5 && !isNaN(chanceNum) && chanceNum >= 1 && chanceNum <= 10) {
          draws.push({
            date: this.parseDate(dateStr),
            numbers: numbers.sort((a, b) => a - b),
            chance: chanceNum
          });
        }
      } catch (error) {
        console.warn('Ligne ignorée:', row, error);
      }
    }

    console.log(`${draws.length} tirages importés sur ${data.length} lignes`);
    return draws;
  }

  parseDate(dateStr) {
    if (!dateStr) return 'Date inconnue';
    
    const str = dateStr.toString().trim();
    
    if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      return str;
    }
    
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = str.split('-');
      return `${day}/${month}/${year}`;
    }
    
    if (str.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
      return str.replace(/-/g, '/');
    }

    try {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      console.warn('Date non parsable:', str);
    }

    return str;
  }

  calculateStats(draws) {
    const numberFreq = Array(50).fill(0);
    const chanceFreq = Array(11).fill(0);

    draws.forEach(draw => {
      draw.numbers.forEach(num => numberFreq[num]++);
      chanceFreq[draw.chance]++;
    });

    const numberStats = numberFreq
      .map((freq, num) => ({
        number: num,
        frequency: freq,
        percentage: ((freq / draws.length) * 100).toFixed(2)
      }))
      .filter(stat => stat.number > 0);

    const chanceStats = chanceFreq
      .map((freq, num) => ({
        number: num,
        frequency: freq,
        percentage: ((freq / draws.length) * 100).toFixed(2)
      }))
      .filter(stat => stat.number > 0);

    numberStats.sort((a, b) => b.frequency - a.frequency);
    chanceStats.sort((a, b) => b.frequency - a.frequency);

    return {
      numbers: numberStats,
      chances: chanceStats,
      totalDraws: draws.length,
      mostFrequent: numberStats.slice(0, 10),
      leastFrequent: numberStats.slice(-10).reverse()
    };
  }

  compareDraw(suggested, actual) {
    const matchingNumbers = suggested.numbers.filter(num => 
      actual.numbers.includes(num)
    ).length;
    
    const matchingChance = suggested.chance === actual.chance;

    return {
      matchingNumbers,
      matchingChance,
      isWinner: matchingNumbers >= 2 || (matchingNumbers >= 1 && matchingChance)
    };
  }
}

export const lotoService = new LotoService();