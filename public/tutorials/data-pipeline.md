# Building Resilient Data Pipeline for Real-Time Analytics

This tutorial walks you through building a production-grade data pipeline for processing real-time analytics events. We'll use AWS services combined with open-source tools to create a scalable, fault-tolerant system.

## Prerequisites
- AWS Account with appropriate permissions
- Terraform installed
- Kafka experience
- Basic understanding of Prometheus/Grafana
- Docker and Docker Compose installed

## Infrastructure Setup

### 1. MSK Cluster Configuration
Amazon MSK (Managed Streaming for Kafka) provides a fully managed Apache Kafka service that makes it easy to ingest and process streaming data in real-time. The configuration below sets up a highly available cluster with three broker nodes for redundancy and data replication.

```hcl
resource "aws_msk_cluster" "kafka_cluster" {
  cluster_name           = "analytics-kafka-cluster"
  kafka_version          = "2.8.1"
  number_of_broker_nodes = 3
  
  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = module.vpc.private_subnets
    security_groups = [aws_security_group.kafka.id]
    
    storage_info {
      ebs_storage_info {
        volume_size = 1000
      }
    }
  }
  
  encryption_info {
    encryption_at_rest_kms_key_arn = aws_kms_key.kafka.arn
  }
}
```

Key configuration aspects:
- Three broker nodes for high availability
- EBS volume size of 1000GB for data storage
- KMS encryption at rest for security
- M5.large instances for balanced compute and memory

### 2. Kinesis Configuration
Amazon Kinesis Data Firehose is a fully managed service for delivering real-time streaming data to destinations such as Amazon S3, Redshift, or Elasticsearch. In our pipeline, it acts as a reliable buffer between data producers and our data lake storage in S3.

```hcl
resource "aws_kinesis_firehose_delivery_stream" "analytics" {
  name        = "analytics-stream"
  destination = "s3"
  
  s3_configuration {
    role_arn   = aws_iam_role.firehose_role.arn
    bucket_arn = aws_s3_bucket.analytics.arn
    prefix     = "raw-data/"
    
    buffering_size = 5
    buffering_interval = 300
    
    compression_format = "GZIP"
  }
}
```

Key features:
- Automatic data compression (GZIP) to reduce storage costs
- 5MB buffering size for optimal S3 write performance
- 5-minute buffering interval for timely data delivery
- Data partitioning by prefix for efficient querying

## Event Streaming Setup

### 1. Kafka Topics
Kafka topics are the foundation of our streaming architecture. We define two main topics: raw-events for incoming data and processed-events for transformed data. The configuration ensures durability and efficient data handling.

```yaml
# kafka-topics.yaml
topics:
  - name: raw-events
    partitions: 12
    replication-factor: 3
    config:
      retention.ms: 604800000
      cleanup.policy: delete
  
  - name: processed-events
    partitions: 12
    replication-factor: 3
    config:
      retention.ms: 604800000
      cleanup.policy: compact
```

Topic design considerations:
- 12 partitions for scalable parallel processing
- 3x replication for fault tolerance
- 7-day retention for raw events
- Compaction for processed events to maintain the latest state

### 2. Producer Configuration
The producer configuration is crucial for ensuring reliable data delivery. Our setup prioritizes data durability and exactly-once semantics while maintaining good performance.

```java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
props.put(ProducerConfig.ACKS_CONFIG, "all");
props.put(ProducerConfig.RETRIES_CONFIG, 3);
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
```

Key settings explained:
- "acks=all" ensures maximum durability
- Idempotence prevents duplicate events
- Multiple retries for handling temporary network issues
- JSON serialization for flexible event schemas

## Data Processing Layer

### 1. Flink Job Configuration
Apache Flink provides powerful stream processing capabilities. Our Kubernetes deployment configuration ensures the job is highly available and can scale based on processing demands.

```yaml
apiVersion: flink.apache.org/v1beta1
kind: FlinkDeployment
metadata:
  name: analytics-processor
spec:
  image: flink:1.14
  flinkVersion: v1_14
  flinkConfiguration:
    taskmanager.numberOfTaskSlots: "2"
    parallelism.default: "2"
  serviceAccount: flink
  jobManager:
    replicas: 1
    resources:
      memory: "2048m"
      cpu: 1
  taskManager:
    replicas: 3
    resources:
      memory: "2048m"
      cpu: 1
```

Configuration highlights:
- 2 task slots per manager for parallel processing
- 3 task manager replicas for scalability
- Balanced memory and CPU allocation
- Service account for secure pod execution

### 2. Stream Processing Logic
The stream processing job implements the core business logic, transforming raw events into actionable insights using Flink's powerful windowing and state management capabilities.

```java
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

DataStream<Event> events = env
    .addSource(new FlinkKafkaConsumer<>("raw-events", new JsonDeserializationSchema<>(), properties))
    .keyBy(Event::getUserId)
    .window(TumblingEventTimeWindows.of(Time