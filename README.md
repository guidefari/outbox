- order service. our core service
- relay service. this one periodically reads the outbox table, and emits non-processed things to the message queue
- postgres
  - Orders
  - Outbox
- message queue. I want to use this as a notification service
    - order.created
    - order.updated
    - order.cancelled
    - order.completed

At this point, I can add multiple downstream services that are subscribed to the message queue topics

- email service 

## Simplified version
- order service
- async service
    - this one reads from the outbox table that is shared between both services, then does all the async jobs
