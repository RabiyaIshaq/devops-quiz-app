# DevOps Quiz Web Application

A static web application for testing DevOps knowledge, built as part of a Distributed Version Control assignment.

## Features
- Interactive quiz interface with 20+ DevOps questions
- Four DevOps topics: CI, CD, IaC, and Version Control
- Detailed explanations for every answer
- Score tracking with accuracy percentage
- Responsive design for all devices
- Question bank in JSON format for easy maintenance
- Support for adding new questions dynamically

## Technologies Used
- HTML5
- CSS3 (with Flexbox and Grid)
- JavaScript (ES6+)
- Git for version control
- GitHub for collaboration

## Project Structure

## Question Bank Specifications

### Topics Covered:
1. **Continuous Integration (5 questions)**
   - CI concepts and benefits
   - CI pipeline triggers
   - Popular CI tools

2. **Continuous Delivery (5 questions)**
   - CD vs Continuous Deployment
   - Deployment strategies (blue-green, canary)
   - Deployment pipelines

3. **Infrastructure as Code (6 questions)**
   - IaC concepts and benefits
   - Popular IaC tools (Terraform, Ansible, Chef, Puppet)
   - Immutable infrastructure
   - Idempotency in IaC

4. **Version Control Systems (4 questions)**
   - Git commands and workflows
   - Branching strategies
   - Merge vs Rebase

5. **DevOps Culture (4 questions)**
   - DevOps principles and cultural shifts
   - Shift-left methodology
   - Blameless postmortems
   - The Three Ways

### Question Format:
```json
{
  "id": "Q1",
  "topic": "Continuous Integration",
  "question": "What is the primary goal of Continuous Integration?",
  "options": [
    "Automatically deploy to production",
    "Frequently integrate code changes into a shared repository",
    "Eliminate the need for testing",
    "Remove the need for branches"
  ],
  "answerIndex": 1,
  "explanation": "Continuous Integration aims to detect integration issues early..."
}