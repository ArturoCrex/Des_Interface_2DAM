// Supabase Integration
/* global supabase, monogatari */

// --------------------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------------------
// REPLACE THESE VALUES WITH YOUR OWN FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://rrtflnywuswulrusyndh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Pjx2J-Ml-lAaFdlmDB2bYg_9xHdPwI-';
// --------------------------------------------------------------------------

// Initialize Supabase
let sbClient = null;
if (typeof supabase !== 'undefined') {
    sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase SDK not loaded.');
}

// Stats Notification UI
function showStatNotification(text, count, percentage = null) {
    const notif = document.createElement('div');
    notif.className = 'stat-notification';

    let content = `<span class="stat-icon">📡</span> ${text}`;
    content += `<br><small>Jugadores: ${count}</small>`;

    if (percentage !== null) {
        content += `<br><strong style="color:#0f0">${percentage}% del total</strong>`;
    }

    notif.innerHTML = content;
    document.body.appendChild(notif);

    // Animate
    setTimeout(() => notif.classList.add('visible'), 100);
    setTimeout(() => {
        notif.classList.remove('visible');
        setTimeout(() => document.body.removeChild(notif), 500);
    }, 5000);
}

// Main Function to Record and Show Stat
window.recordAndShowStat = async function (choiceName, displayText) {
    if (!sbClient) return;

    try {
        // 1. Increment Stat (RPC)
        const { error: rpcError } = await sbClient.rpc('increment_stat', { row_name: choiceName });
        if (rpcError) throw rpcError;

        // 2. Fetch Updated Count
        const { data: userData, error: fetchError } = await sbClient
            .from('game_stats')
            .select('count')
            .eq('choice_name', choiceName)
            .single();

        if (fetchError) throw fetchError;
        const userCount = userData.count;

        // 3. Calculate Percentage (Only for Endings)
        let percentage = null;
        if (choiceName.startsWith('final_')) {
            const { data: allStats, error: allStatsError } = await sbClient
                .from('game_stats')
                .select('count')
                .in('choice_name', ['final_1_hero', 'final_2_escape', 'final_3_death']);

            if (!allStatsError && allStats) {
                const total = allStats.reduce((sum, row) => sum + row.count, 0);
                if (total > 0) {
                    percentage = Math.round((userCount / total) * 100);
                }
            }
        }

        // 4. Show Notification
        showStatNotification(displayText, userCount, percentage);

    } catch (err) {
        console.error('Supabase Error:', err);
    }
};
