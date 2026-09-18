const dashboardRepository = require('./dashboard_repository');

class DashboardService {
  async getDashboardMetrics() {
    const [todayStats, totalAllOrders, lowStockItems, weeklySales, recentOrders] =
      await Promise.all([
        dashboardRepository.getTodaySalesAndOrders(),
        dashboardRepository.getTotalAllOrders(),
        dashboardRepository.getLowStockItems(5),
        dashboardRepository.getWeeklySales(),
        dashboardRepository.getRecentActionableOrders(5)
      ]);

    return {
      kpis: {
        total_sales_today: Number(todayStats.total_sales_today),
        totalSalesToday: Number(todayStats.total_sales_today),
        total_orders_today: Number(todayStats.total_orders_today),
        totalOrdersToday: Number(todayStats.total_orders_today),
        total_all_orders: Number(totalAllOrders),
        totalAllOrders: Number(totalAllOrders),
        low_stock_count: lowStockItems.length,
        lowStockCount: lowStockItems.length,
        low_stock_items: lowStockItems,
        lowStockItems
      },
      weekly_sales: weeklySales,
      weeklySales,
      recent_orders: recentOrders,
      recentOrders
    };
  }

}

module.exports = new DashboardService();

