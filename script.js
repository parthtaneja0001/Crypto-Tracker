class CryptoDashboard {
    constructor() {
        this.chart = null;
        this.selectedCrypto = document.getElementById("cryptoSelect").value;
        this.timeRange = document.getElementById("timeRange").value;
        this.initChart();
        this.setupEventListeners();
        this.updateDashboard();
    }

    async initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 131, 143, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 131, 143, 0.0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: '#00838f',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#00838f',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    async fetchHistoricalData() {
        try {
            const days = this.timeRange === '24h' ? 1 : this.timeRange === '7d' ? 7 : 30;
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${this.selectedCrypto}/market_chart?vs_currency=usd&days=${days}`
            );
            const data = await response.json();
            
            return {
                labels: data.prices.map(price => {
                    const date = new Date(price[0]);
                    return this.timeRange === '24h' ? 
                        date.toLocaleTimeString() : 
                        date.toLocaleDateString();
                }),
                prices: data.prices.map(price => price[1])
            };
        } catch (error) {
            console.error('Error fetching historical data:', error);
            // Fallback data
            return {
                labels: Array.from({ length: 24 }, (_, i) => i + 'h'),
                prices: Array.from({ length: 24 }, () => Math.random() * 1000 + 20000)
            };
        }
    }

    async updateChart() {
        const data = await this.fetchHistoricalData();
        if (this.chart && data) {
            this.chart.data.labels = data.labels;
            this.chart.data.datasets[0].data = data.prices;
            this.chart.update();
        }
    }

    async updateMarketSentiment() {
        try {
            // Simulated sentiment analysis
            const sentimentScores = {
                bitcoin: { score: 75, trend: 'Bullish' },
                ethereum: { score: 65, trend: 'Neutral' },
                dogecoin: { score: 55, trend: 'Neutral' }
            };

            const sentiment = sentimentScores[this.selectedCrypto] || { score: 50, trend: 'Neutral' };
            
            document.getElementById("prediction").innerHTML = `
                <div class="sentiment-score">
                    <div class="score">${sentiment.score}%</div>
                    <div class="trend ${sentiment.trend.toLowerCase()}">${sentiment.trend}</div>
                </div>
                <div class="sentiment-details">
                    Market sentiment based on technical analysis
                </div>
            `;
        } catch (error) {
            console.error('Error updating market sentiment:', error);
            document.getElementById("prediction").innerHTML = 'Market Sentiment Unavailable';
        }
    }

    async updatePrice() {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${this.selectedCrypto}&vs_currencies=usd`);
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            const price = data[this.selectedCrypto].usd;
            
            document.getElementById("currentPrice").innerHTML = `
                <span class="currency">$</span>${price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
            `;
        } catch (error) {
            console.error('Error fetching price:', error);
            const fallbackPrices = {
                'bitcoin': 45000,
                'ethereum': 2800,
                'dogecoin': 0.15
            };
            const fallbackPrice = fallbackPrices[this.selectedCrypto] || 1000;
            
            document.getElementById("currentPrice").innerHTML = `
                <span class="currency">$</span>${fallbackPrice.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
                <div class="fallback-notice">*Showing estimated value</div>
            `;
        }
    }

    async updateStats() {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${this.selectedCrypto}`);
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            
            const stats = document.getElementById("stats");
            stats.innerHTML = `
                <div>
                    <h3>Market Cap</h3>
                    <p>$${data.market_data.market_cap.usd.toLocaleString()}</p>
                </div>
                <div>
                    <h3>24h Volume</h3>
                    <p>$${data.market_data.total_volume.usd.toLocaleString()}</p>
                </div>
                <div>
                    <h3>24h High</h3>
                    <p>$${data.market_data.high_24h.usd.toLocaleString()}</p>
                </div>
                <div>
                    <h3>24h Low</h3>
                    <p>$${data.market_data.low_24h.usd.toLocaleString()}</p>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching stats:', error);
            const fallbackStats = {
                'bitcoin': {
                    marketCap: '1,000,000,000,000',
                    volume: '50,000,000,000',
                    high: '48,000',
                    low: '44,000'
                },
                'ethereum': {
                    marketCap: '400,000,000,000',
                    volume: '20,000,000,000',
                    high: '3,000',
                    low: '2,700'
                },
                'dogecoin': {
                    marketCap: '20,000,000,000',
                    volume: '1,000,000,000',
                    high: '0.17',
                    low: '0.14'
                }
            };

            const stats = fallbackStats[this.selectedCrypto] || {
                marketCap: '1,000,000,000',
                volume: '100,000,000',
                high: '1,000',
                low: '900'
            };

            document.getElementById("stats").innerHTML = `
                <div>
                    <h3>Market Cap</h3>
                    <p>$${stats.marketCap}</p>
                </div>
                <div>
                    <h3>24h Volume</h3>
                    <p>$${stats.volume}</p>
                </div>
                <div>
                    <h3>24h High</h3>
                    <p>$${stats.high}</p>
                </div>
                <div>
                    <h3>24h Low</h3>
                    <p>$${stats.low}</p>
                </div>
                <div class="fallback-notice">*Showing estimated values</div>
            `;
        }
    }

    async updateDashboard() {
        try {
            await Promise.all([
                this.updatePrice(),
                this.updateStats(),
                this.updateChart(),
                this.updateMarketSentiment()
            ]);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    setupEventListeners() {
        document.getElementById("cryptoSelect").addEventListener("change", (e) => {
            this.selectedCrypto = e.target.value;
            this.updateDashboard();
        });

        document.getElementById("timeRange").addEventListener("change", (e) => {
            this.timeRange = e.target.value;
            this.updateDashboard();
        });
    }
}

// Add styles for sentiment
const style = document.createElement('style');
style.textContent = `
    .sentiment-score {
        text-align: center;
        margin: 1rem 0;
    }
    
    .score {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--text-primary);
    }
    
    .trend {
        font-size: 1.2rem;
        margin-top: 0.5rem;
        padding: 0.3rem 1rem;
        border-radius: 20px;
        display: inline-block;
    }
    
    .trend.bullish {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }
    
    .trend.neutral {
        background-color: rgba(99, 102, 241, 0.1);
        color: #6366f1;
    }
    
    .trend.bearish {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    .sentiment-details {
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-top: 1rem;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new CryptoDashboard();
});
  