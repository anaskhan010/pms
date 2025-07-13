import api from "./api";
import { propertyApiService } from "./propertyApiService";
import { adminApiService } from "./adminApiService";

/**
 * Enterprise Admin Dashboard Service
 * Provides comprehensive dashboard data integration with real APIs
 */
export const adminDashboardService = {
  /**
   * Get comprehensive dashboard overview
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardOverview() {
    try {
      // Fetch data from multiple endpoints in parallel
      const [
        tenantStats,
        propertyStats,
        occupancyAnalytics,
        recentTenants,
        recentProperties
      ] = await Promise.allSettled([
        adminApiService.getTenantStatistics(),
        propertyApiService.getOverallPropertyStatistics(),
        propertyApiService.getOccupancyAnalytics(),
        adminApiService.getTenants({ page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'desc' }),
        propertyApiService.getProperties({ page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'desc' })
      ]);

      // Process results and handle any failures gracefully
      const dashboardData = {
        tenantStatistics: tenantStats.status === 'fulfilled' && tenantStats.value.success
          ? tenantStats.value.data
          : this.getDefaultTenantStats(),

        propertyStatistics: propertyStats.status === 'fulfilled' && propertyStats.value.success
          ? propertyStats.value.data
          : this.getDefaultPropertyStats(),

        occupancyAnalytics: occupancyAnalytics.status === 'fulfilled' && occupancyAnalytics.value.success
          ? occupancyAnalytics.value.data
          : [],

        recentTenants: recentTenants.status === 'fulfilled' && recentTenants.value.success
          ? recentTenants.value.data
          : [],

        recentProperties: recentProperties.status === 'fulfilled' && recentProperties.value.success
          ? recentProperties.value.data
          : [],

        lastUpdated: new Date().toISOString()
      };

      // Log any failed API calls for debugging
      if (tenantStats.status === 'rejected' || !tenantStats.value?.success) {
        console.warn('Tenant statistics API failed:', tenantStats.reason || tenantStats.value?.error);
      }
      if (propertyStats.status === 'rejected' || !propertyStats.value?.success) {
        console.warn('Property statistics API failed:', propertyStats.reason || propertyStats.value?.error);
      }
      if (occupancyAnalytics.status === 'rejected' || !occupancyAnalytics.value?.success) {
        console.warn('Occupancy analytics API failed:', occupancyAnalytics.reason || occupancyAnalytics.value?.error);
      }
      if (recentTenants.status === 'rejected' || !recentTenants.value?.success) {
        console.warn('Recent tenants API failed:', recentTenants.reason || recentTenants.value?.error);
      }
      if (recentProperties.status === 'rejected' || !recentProperties.value?.success) {
        console.warn('Recent properties API failed:', recentProperties.reason || recentProperties.value?.error);
      }

      // Calculate derived metrics
      dashboardData.summary = this.calculateSummaryMetrics(dashboardData);

      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch dashboard data",
        data: this.getDefaultDashboardData()
      };
    }
  },

  /**
   * Get real-time statistics for dashboard cards
   * @returns {Promise<Object>} Statistics data
   */
  async getDashboardStats() {
    try {
      const [tenantStats, propertyStats] = await Promise.allSettled([
        adminApiService.getTenantStatistics(),
        propertyApiService.getOverallPropertyStatistics()
      ]);

      const stats = [];

      // Tenant statistics
      if (tenantStats.status === 'fulfilled' && tenantStats.value.success) {
        const data = tenantStats.value.data.overview;
        stats.push(
          {
            title: "Total Tenants",
            value: data.total_tenants || 0,
            icon: "users",
            color: "indigo",
            link: "/admin/tenants",
            subValue: `${data.active_tenants || 0} Active, ${data.inactive_tenants || 0} Inactive`,
            trend: data.new_this_month > 0 ? `+${data.new_this_month} this month` : null
          }
        );
      }

      // Property statistics
      if (propertyStats.status === 'fulfilled' && propertyStats.value.success) {
        const data = propertyStats.value.data.overview;
        stats.push(
          {
            title: "Total Properties",
            value: data.total_properties || 0,
            icon: "building",
            color: "teal",
            link: "/admin/properties",
            subValue: `${data.total_units || 0} Total Units`,
            trend: data.new_this_month > 0 ? `+${data.new_this_month} this month` : null
          },
          {
            title: "Apartments",
            value: data.apartments || 0,
            icon: "home",
            color: "emerald",
            link: "/admin/properties?type=apartment"
          },
          {
            title: "Villas",
            value: data.villas || 0,
            icon: "home",
            color: "purple",
            link: "/admin/properties?type=villa"
          }
        );
      }

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch dashboard statistics",
        data: this.getDefaultStats()
      };
    }
  },

  /**
   * Get recent activities from various endpoints
   * @returns {Promise<Object>} Recent activities
   */
  async getRecentActivities() {
    try {
      // This would typically come from an audit log or activity feed
      // For now, we'll simulate with recent tenants and properties
      const [recentTenants, recentProperties] = await Promise.allSettled([
        adminApiService.getTenants({ page: 1, limit: 3, sortBy: 'created_at', sortOrder: 'desc' }),
        propertyApiService.getProperties({ page: 1, limit: 3, sortBy: 'created_at', sortOrder: 'desc' })
      ]);

      const activities = [];

      // Add tenant activities
      if (recentTenants.status === 'fulfilled' && recentTenants.value.success) {
        recentTenants.value.data.forEach(tenant => {
          activities.push({
            id: `tenant-${tenant.tenant_id}`,
            type: "tenant_added",
            activity: "New tenant registered",
            date: this.formatRelativeTime(tenant.created_at),
            details: `${tenant.first_name} ${tenant.last_name} has been registered as a new tenant.`,
            icon: "user-plus",
            color: "green"
          });
        });
      }

      // Add property activities
      if (recentProperties.status === 'fulfilled' && recentProperties.value.success) {
        recentProperties.value.data.forEach(property => {
          activities.push({
            id: `property-${property.property_id}`,
            type: "property_added",
            activity: "New property added",
            date: this.formatRelativeTime(property.created_at),
            details: `Property ${property.property_number} in ${property.city} has been added to the system.`,
            icon: "building",
            color: "blue"
          });
        });
      }

      // Sort by date and limit to 10 most recent
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return {
        success: true,
        data: activities.slice(0, 10)
      };
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch recent activities",
        data: []
      };
    }
  },

  /**
   * Get chart data for dashboard visualizations
   * @returns {Promise<Object>} Chart data
   */
  async getChartData() {
    try {
      const [tenantStats, propertyStats, occupancyData] = await Promise.allSettled([
        adminApiService.getTenantStatistics(),
        propertyApiService.getOverallPropertyStatistics(),
        propertyApiService.getOccupancyAnalytics()
      ]);

      const chartData = {};

      // Tenant registration trends
      if (tenantStats.status === 'fulfilled' && tenantStats.value.success) {
        chartData.tenantTrends = tenantStats.value.data.registration_trends || [];
        chartData.nationalityDistribution = tenantStats.value.data.nationality_distribution || [];
      }

      // Property distribution
      if (propertyStats.status === 'fulfilled' && propertyStats.value.success) {
        chartData.propertyTypes = propertyStats.value.data.type_distribution || [];
        chartData.cityDistribution = propertyStats.value.data.city_distribution || [];
      }

      // Occupancy data
      if (occupancyData.status === 'fulfilled' && occupancyData.value.success) {
        chartData.occupancyRates = occupancyData.value.data || [];
      }

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error("Error fetching chart data:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch chart data",
        data: {}
      };
    }
  },

  /**
   * Calculate summary metrics from dashboard data
   * @param {Object} dashboardData - Raw dashboard data
   * @returns {Object} Summary metrics
   */
  calculateSummaryMetrics(dashboardData) {
    const tenantStats = dashboardData.tenantStatistics?.overview || {};
    const propertyStats = dashboardData.propertyStatistics?.overview || {};
    
    return {
      totalRevenue: "SAR 152,000", // This would come from a financial API
      occupancyRate: this.calculateOverallOccupancyRate(dashboardData.occupancyAnalytics),
      activeContracts: tenantStats.active_tenants || 0,
      maintenanceRequests: 0, // This would come from a maintenance API
      growthRate: this.calculateGrowthRate(tenantStats.new_this_month, tenantStats.total_tenants)
    };
  },

  /**
   * Calculate overall occupancy rate
   * @param {Array} occupancyData - Occupancy analytics data
   * @returns {string} Formatted occupancy rate
   */
  calculateOverallOccupancyRate(occupancyData) {
    if (!occupancyData || occupancyData.length === 0) return "0%";
    
    const totalUnits = occupancyData.reduce((sum, property) => sum + (property.total_units || 0), 0);
    const occupiedUnits = occupancyData.reduce((sum, property) => sum + (property.occupied_units || 0), 0);
    
    if (totalUnits === 0) return "0%";
    
    const rate = (occupiedUnits / totalUnits * 100).toFixed(1);
    return `${rate}%`;
  },

  /**
   * Calculate growth rate
   * @param {number} newCount - New items this period
   * @param {number} totalCount - Total items
   * @returns {string} Formatted growth rate
   */
  calculateGrowthRate(newCount, totalCount) {
    if (!newCount || !totalCount) return "0%";
    const rate = (newCount / totalCount * 100).toFixed(1);
    return `+${rate}%`;
  },

  /**
   * Format relative time
   * @param {string} dateString - ISO date string
   * @returns {string} Relative time string
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Get default dashboard data for fallback
   * @returns {Object} Default dashboard data
   */
  getDefaultDashboardData() {
    return {
      tenantStatistics: this.getDefaultTenantStats(),
      propertyStatistics: this.getDefaultPropertyStats(),
      occupancyAnalytics: [],
      recentTenants: [],
      recentProperties: [],
      summary: {
        totalRevenue: "SAR 0",
        occupancyRate: "0%",
        activeContracts: 0,
        maintenanceRequests: 0,
        growthRate: "0%"
      },
      lastUpdated: new Date().toISOString()
    };
  },

  /**
   * Get default tenant statistics
   * @returns {Object} Default tenant stats
   */
  getDefaultTenantStats() {
    return {
      overview: {
        total_tenants: 0,
        active_tenants: 0,
        inactive_tenants: 0,
        new_this_month: 0,
        new_this_week: 0
      },
      nationality_distribution: [],
      registration_trends: []
    };
  },

  /**
   * Get default property statistics
   * @returns {Object} Default property stats
   */
  getDefaultPropertyStats() {
    return {
      overview: {
        total_properties: 0,
        active_properties: 0,
        inactive_properties: 0,
        apartments: 0,
        villas: 0,
        offices: 0,
        total_units: 0
      },
      city_distribution: [],
      type_distribution: []
    };
  },

  /**
   * Get default statistics for dashboard cards
   * @returns {Array} Default stats
   */
  getDefaultStats() {
    return [
      {
        title: "Total Tenants",
        value: 0,
        icon: "users",
        color: "indigo",
        link: "/admin/tenants"
      },
      {
        title: "Total Properties",
        value: 0,
        icon: "building",
        color: "teal",
        link: "/admin/properties"
      },
      {
        title: "Apartments",
        value: 0,
        icon: "home",
        color: "emerald",
        link: "/admin/properties"
      },
      {
        title: "Villas",
        value: 0,
        icon: "home",
        color: "purple",
        link: "/admin/properties"
      }
    ];
  }
};

export default adminDashboardService;
