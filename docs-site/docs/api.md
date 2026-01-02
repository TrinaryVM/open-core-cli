---
sidebar_position: 6
---

# API Reference

Complete API documentation for TrinaryVM, including REST endpoints, GraphQL queries, and WebSocket connections.

## Overview

TrinaryVM provides comprehensive APIs for:

- **REST API**: Standard HTTP endpoints for all operations
- **GraphQL**: Flexible query language for complex data operations
- **WebSocket**: Real-time communication for live updates
- **Authentication**: Secure access control and authorization

## Base URL

```
Production: https://api.trinaryvm.org/v1
Development: http://localhost:3020/api/v1
```

## Authentication

All API requests require authentication using JWT tokens.

### Get Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password",
  "mfa": "123456"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Using Access Token

```http
GET /api/v1/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## REST API Endpoints

### System Status

#### Get System Status

```http
GET /api/v1/status
```

Response:
```json
{
  "status": "operational",
  "version": "2.0.0",
  "uptime": 86400,
  "components": {
    "trinaryvm_core": "online",
    "vliw_processor": "active",
    "security_protocols": "engaged",
    "quantum_uplink": "secure"
  },
  "timestamp": "2025-01-02T11:30:00Z"
}
```

#### Get Health Check

```http
GET /api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "trifhe": "ok",
    "vliw": "ok"
  },
  "response_time": 0.05
}
```

### VLIW Processing

#### Get VLIW Status

```http
GET /api/v1/vliw/status
```

Response:
```json
{
  "status": "active",
  "units": {
    "total": 4,
    "active": 4,
    "utilization": 0.87
  },
  "performance": {
    "throughput": 2400000,
    "latency": 0.42,
    "efficiency": 0.91
  },
  "security": {
    "trifhe": "engaged",
    "encryption": "active",
    "threat_level": "low"
  }
}
```

#### Control VLIW Processing

```http
POST /api/v1/vliw/control
Content-Type: application/json

{
  "action": "pause|resume|reset",
  "units": [0, 1, 2, 3],
  "reason": "maintenance"
}
```

Response:
```json
{
  "success": true,
  "action": "pause",
  "units_affected": [0, 1, 2, 3],
  "timestamp": "2025-01-02T11:30:00Z"
}
```

#### Get Performance Metrics

```http
GET /api/v1/vliw/metrics
```

Response:
```json
{
  "timestamp": "2025-01-02T11:30:00Z",
  "metrics": {
    "instructions_per_second": 2400000,
    "parallel_efficiency": 0.91,
    "memory_bandwidth": 1250000000,
    "cache_hit_rate": 0.94,
    "ternary_distribution": {
      "negative": 0.33,
      "neutral": 0.34,
      "positive": 0.33
    }
  }
}
```

### Security Operations

#### Get Security Status

```http
GET /api/v1/security/status
```

Response:
```json
{
  "trifhe": {
    "status": "engaged",
    "encryption_level": "high",
    "key_rotation": "automatic"
  },
  "symbolic": {
    "encoding": "tai-xuan",
    "validation": "active",
    "integrity": "verified"
  },
  "threats": {
    "level": "low",
    "detected": 0,
    "blocked": 0
  }
}
```

#### Encrypt Data

```http
POST /api/v1/security/encrypt
Content-Type: application/json

{
  "data": "sensitive information",
  "algorithm": "trifhe",
  "securityLevel": 2187,
  "keyspace": "3^2187"
}
```

Response:
```json
{
  "encrypted_data": "encrypted_base64_string",
  "key_id": "key_abc123",
  "algorithm": "trifhe",
  "securityLevel": 2187,
  "keyspace": "3^2187",
  "timestamp": "2025-01-02T11:30:00Z"
}
```

#### Decrypt Data

```http
POST /api/v1/security/decrypt
Content-Type: application/json

{
  "encrypted_data": "encrypted_base64_string",
  "key_id": "key_abc123"
}
```

Response:
```json
{
  "decrypted_data": "sensitive information",
  "algorithm": "trifhe",
  "securityLevel": 2187,
  "timestamp": "2025-01-02T11:30:00Z"
}
```

### Hardware Acceleration

#### Get Hardware Status

```http
GET /api/v1/hardware/status
```

Response:
```json
{
  "cuda": {
    "available": true,
    "devices": 2,
    "utilization": 0.75
  },
  "fpga": {
    "available": true,
    "bitstream": "trinaryvm-accelerator.bit",
    "status": "active"
  },
  "asic": {
    "available": false,
    "simulation": true
  }
}
```

#### Configure Hardware

```http
POST /api/v1/hardware/configure
Content-Type: application/json

{
  "cuda": {
    "enabled": true,
    "devices": [0, 1],
    "memory": "unified"
  },
  "fpga": {
    "enabled": true,
    "bitstream": "latest"
  }
}
```

Response:
```json
{
  "success": true,
  "configuration": {
    "cuda": "enabled",
    "fpga": "enabled",
    "asic": "simulation"
  },
  "timestamp": "2025-01-02T11:30:00Z"
}
```

## GraphQL API

### Endpoint

```
POST /api/v1/graphql
```

### Schema

```graphql
type Query {
  status: SystemStatus
  vliwStatus: VLIWStatus
  securityStatus: SecurityStatus
  hardwareStatus: HardwareStatus
}

type Mutation {
  controlVLIW(action: String!, units: [Int!]): VLIWResponse
  encryptData(data: String!, algorithm: String): EncryptionResponse
  decryptData(encryptedData: String!, keyId: String!): DecryptionResponse
}

type SystemStatus {
  status: String!
  version: String!
  uptime: Int!
  components: ComponentStatus!
}

type VLIWStatus {
  status: String!
  units: UnitStatus!
  performance: PerformanceMetrics!
  security: SecurityInfo!
}
```

### Example Queries

#### Get System Status

```graphql
query GetSystemStatus {
  status {
    status
    version
    uptime
    components {
      trinaryvm_core
      vliw_processor
      security_protocols
      quantum_uplink
    }
  }
}
```

#### Control VLIW Processing

```graphql
mutation ControlVLIW($action: String!, $units: [Int!]) {
  controlVLIW(action: $action, units: $units) {
    success
    action
    units_affected
    timestamp
  }
}
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('wss://api.trinaryvm.org/v1/ws');

ws.onopen = function() {
  console.log('Connected to TrinaryVM WebSocket');
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Real-time Updates

#### Subscribe to VLIW Metrics

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'vliw_metrics',
  interval: 1000 // milliseconds
}));
```

#### Subscribe to Security Alerts

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'security_alerts',
  filters: ['threats', 'encryption']
}));
```

### Message Types

```javascript
// VLIW metrics update
{
  "type": "vliw_metrics",
  "data": {
    "throughput": 2400000,
    "latency": 0.42,
    "efficiency": 0.91
  },
  "timestamp": "2025-01-02T11:30:00Z"
}

// Security alert
{
  "type": "security_alert",
  "data": {
    "level": "warning",
    "message": "Suspicious activity detected",
    "source": "192.168.1.100"
  },
  "timestamp": "2025-01-02T11:30:00Z"
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "action",
      "reason": "Value must be one of: pause, resume, reset"
    },
    "timestamp": "2025-01-02T11:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Rate Limiting

API requests are rate limited to ensure fair usage:

- **Authentication**: 10 requests per minute
- **General API**: 1000 requests per hour
- **VLIW Operations**: 100 requests per hour
- **Security Operations**: 100 requests per hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641024000
```

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @trinaryvm/sdk
```

```javascript
import { TrinaryVMClient } from '@trinaryvm/sdk';

const client = new TrinaryVMClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.trinaryvm.org/v1'
});

// Get system status
const status = await client.getStatus();

// Control VLIW processing
await client.controlVLIW('pause', [0, 1, 2, 3]);
```

### Python

```bash
pip install trinaryvm-sdk
```

```python
from trinaryvm import TrinaryVMClient

client = TrinaryVMClient(
    api_key='your-api-key',
    base_url='https://api.trinaryvm.org/v1'
)

# Get system status
status = client.get_status()

# Control VLIW processing
client.control_vliw('pause', units=[0, 1, 2, 3])
```

## Next Steps

- [Security Protocols](/docs/security) - Secure API usage
- [Hardware Acceleration](/docs/hardware) - Hardware API integration
- [Troubleshooting](/docs/troubleshooting) - API issue resolution
- [CLI Reference](/docs/development/cli) - Command-line tools and usage

