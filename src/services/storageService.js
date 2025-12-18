import { supabase } from './supabaseClient';

class StorageService {
  // Sauvegarder un tirage historique
  async saveHistoricalDraw(draw) {
    const { data, error } = await supabase
      .from('loto_draws')
      .insert([{
        draw_date: this.parseDate(draw.date),
        ball_1: draw.numbers[0],
        ball_2: draw.numbers[1],
        ball_3: draw.numbers[2],
        ball_4: draw.numbers[3],
        ball_5: draw.numbers[4],
        chance: draw.chance
      }])
      .select();
    
    if (error) throw error;
    return data;
  }

  // Importer plusieurs tirages
  async importDraws(draws) {
    const drawsData = draws.map(draw => ({
      draw_date: this.parseDate(draw.date),
      ball_1: draw.numbers[0],
      ball_2: draw.numbers[1],
      ball_3: draw.numbers[2],
      ball_4: draw.numbers[3],
      ball_5: draw.numbers[4],
      chance: draw.chance
    }));

    const { data, error } = await supabase
      .from('loto_draws')
      .upsert(drawsData, { onConflict: 'draw_date' })
      .select();
    
    if (error) throw error;
    
    // Recalculer les statistiques
    await supabase.rpc('refresh_statistics');
    
    return data;
  }

  // Récupérer tous les tirages
  async getAllDraws() {
    const { data, error } = await supabase
      .from('loto_draws')
      .select('*')
      .order('draw_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(draw => ({
      date: this.formatDate(draw.draw_date),
      numbers: [draw.ball_1, draw.ball_2, draw.ball_3, draw.ball_4, draw.ball_5],
      chance: draw.chance
    }));
  }

  // Récupérer les statistiques
  async getStatistics() {
    const { data, error } = await supabase
      .from('loto_statistics')
      .select('*');
    
    if (error) throw error;
    
    const stats = {};
    data.forEach(row => {
      stats[row.stat_type] = row.stat_data;
    });
    
    return {
      numbers: stats.numbers || [],
      chances: stats.chances || [],
      totalDraws: stats.total_draws?.count || 0,
      mostFrequent: (stats.numbers || []).slice(0, 10),
      leastFrequent: (stats.numbers || []).slice(-10).reverse()
    };
  }

  // Sauvegarder une prédiction utilisateur
  async savePrediction(prediction, userId) {
    const { data, error } = await supabase
      .from('user_predictions')
      .insert([{
        user_id: userId,
        prediction_date: this.parseDate(prediction.date),
        ball_1: prediction.numbers[0],
        ball_2: prediction.numbers[1],
        ball_3: prediction.numbers[2],
        ball_4: prediction.numbers[3],
        ball_5: prediction.numbers[4],
        chance: prediction.chance
      }])
      .select();
    
    if (error) throw error;
    return data;
  }

  // Récupérer les prédictions d'un utilisateur
  async getUserPredictions(userId) {
    const { data, error } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(pred => ({
      id: pred.id,
      date: this.formatDate(pred.prediction_date),
      numbers: [pred.ball_1, pred.ball_2, pred.ball_3, pred.ball_4, pred.ball_5],
      chance: pred.chance,
      timestamp: pred.created_at
    }));
  }

  // Helpers
  parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}

export const storageService = new StorageService();