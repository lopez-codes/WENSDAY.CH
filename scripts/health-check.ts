#!/usr/bin/env tsx
// Health Check Script for wensday.ch MVP
import { execSync } from 'child_process';
import { storage } from '../server/storage';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  version: string;
  checks: {
    database: HealthCheck;
    aiProviders: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    dependencies: HealthCheck;
  };
  overall: 'pass' | 'fail';
}

interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: any;
  responseTime?: number;
}

class HealthChecker {
  async performHealthCheck(): Promise<HealthStatus> {
    console.log('🏥 Starting comprehensive health check...');
    
    const startTime = Date.now();
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.1.0',
      checks: {
        database: await this.checkDatabase(),
        aiProviders: await this.checkAiProviders(),
        memory: await this.checkMemory(),
        disk: await this.checkDisk(),
        dependencies: await this.checkDependencies()
      },
      overall: 'pass'
    };

    // Determine overall health
    const failedChecks = Object.values(healthStatus.checks).filter(check => check.status === 'fail');
    const warningChecks = Object.values(healthStatus.checks).filter(check => check.status === 'warn');

    if (failedChecks.length > 0) {
      healthStatus.status = 'critical';
      healthStatus.overall = 'fail';
    } else if (warningChecks.length > 0) {
      healthStatus.status = 'warning';
      healthStatus.overall = 'pass';
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Health check completed in ${totalTime}ms`);
    
    return healthStatus;
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test database connection and basic query
      await storage.query('SELECT 1 as test');
      
      // Check database version and status
      const version = await storage.query('SELECT version() as version');
      const connectionCount = await storage.query('SELECT count(*) as connections FROM pg_stat_activity');
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'pass',
        message: 'Database connection healthy',
        responseTime,
        details: {
          version: version[0]?.version?.substring(0, 50) + '...',
          activeConnections: connectionCount[0]?.connections
        }
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkAiProviders(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const providers = await storage.getAllAiProviders();
      const activeProviders = providers.filter(p => p.isActive);
      
      // Test API keys are configured
      const configuredProviders = activeProviders.filter(provider => {
        const envKey = provider.apiKeyName;
        return process.env[envKey] && process.env[envKey] !== '';
      });

      const responseTime = Date.now() - startTime;
      
      if (configuredProviders.length === 0) {
        return {
          status: 'fail',
          message: 'No AI providers configured with API keys',
          responseTime,
          details: {
            totalProviders: providers.length,
            activeProviders: activeProviders.length,
            configuredProviders: 0
          }
        };
      }

      if (configuredProviders.length < activeProviders.length) {
        return {
          status: 'warn',
          message: 'Some AI providers missing API keys',
          responseTime,
          details: {
            totalProviders: providers.length,
            activeProviders: activeProviders.length,
            configuredProviders: configuredProviders.length
          }
        };
      }

      return {
        status: 'pass',
        message: 'All AI providers configured',
        responseTime,
        details: {
          totalProviders: providers.length,
          activeProviders: activeProviders.length,
          configuredProviders: configuredProviders.length
        }
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `AI providers check failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const totalMemoryMB = Math.round(memUsage.rss / 1024 / 1024);
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      const responseTime = Date.now() - startTime;
      
      // Warning if using more than 512MB
      if (totalMemoryMB > 512) {
        return {
          status: 'warn',
          message: `High memory usage: ${totalMemoryMB}MB`,
          responseTime,
          details: {
            rss: totalMemoryMB,
            heapUsed: heapUsedMB,
            heapTotal: heapTotalMB
          }
        };
      }

      return {
        status: 'pass',
        message: `Memory usage normal: ${totalMemoryMB}MB`,
        responseTime,
        details: {
          rss: totalMemoryMB,
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB
        }
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Memory check failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkDisk(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check disk space (Unix systems)
      const diskUsage = execSync('df -h / | tail -1', { encoding: 'utf8' });
      const parts = diskUsage.trim().split(/\s+/);
      const usagePercent = parseInt(parts[4]?.replace('%', '') || '0');
      
      const responseTime = Date.now() - startTime;
      
      if (usagePercent > 90) {
        return {
          status: 'fail',
          message: `Critical disk usage: ${usagePercent}%`,
          responseTime,
          details: { usage: usagePercent, available: parts[3] }
        };
      }

      if (usagePercent > 80) {
        return {
          status: 'warn',
          message: `High disk usage: ${usagePercent}%`,
          responseTime,
          details: { usage: usagePercent, available: parts[3] }
        };
      }

      return {
        status: 'pass',
        message: `Disk usage normal: ${usagePercent}%`,
        responseTime,
        details: { usage: usagePercent, available: parts[3] }
      };
    } catch (error) {
      return {
        status: 'warn',
        message: `Disk check failed (may not be supported): ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkDependencies(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check critical dependencies
      const criticalModules = [
        'express',
        'drizzle-orm',
        'react',
        'openai',
        '@google/genai',
        '@anthropic-ai/sdk'
      ];

      const missingModules = [];
      
      for (const moduleName of criticalModules) {
        try {
          require.resolve(moduleName);
        } catch {
          missingModules.push(moduleName);
        }
      }

      const responseTime = Date.now() - startTime;

      if (missingModules.length > 0) {
        return {
          status: 'fail',
          message: `Critical dependencies missing: ${missingModules.join(', ')}`,
          responseTime,
          details: { missing: missingModules }
        };
      }

      return {
        status: 'pass',
        message: 'All critical dependencies available',
        responseTime,
        details: { checked: criticalModules.length }
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Dependency check failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }
}

// Main execution
async function main() {
  const checker = new HealthChecker();
  
  try {
    const healthStatus = await checker.performHealthCheck();
    
    console.log('\n📊 Health Check Results:');
    console.log('========================');
    console.log(`Overall Status: ${healthStatus.status.toUpperCase()}`);
    console.log(`Timestamp: ${healthStatus.timestamp}`);
    console.log(`Version: ${healthStatus.version}`);
    console.log('');

    // Display individual checks
    Object.entries(healthStatus.checks).forEach(([checkName, result]) => {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${checkName}: ${result.message}`);
      
      if (result.responseTime) {
        console.log(`   Response time: ${result.responseTime}ms`);
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details)}`);
      }
      console.log('');
    });

    // Exit with appropriate code
    process.exit(healthStatus.overall === 'pass' ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Health check failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { HealthChecker };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}