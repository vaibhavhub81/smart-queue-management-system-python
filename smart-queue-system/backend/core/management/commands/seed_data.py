import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from users.models import User
from services.models import Service, Counter

class Command(BaseCommand):
    help = 'Seeds the database with initial data.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        with open(os.path.join(settings.BASE_DIR, 'seed_data.json')) as f:
            data = json.load(f)

        with transaction.atomic():
            self.seed_users(data['users'])
            self.seed_services(data['services'])

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def seed_users(self, users_data):
        self.stdout.write("Seeding users...")
        for user_data in users_data:
            username = user_data['username']
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=user_data.get('email', ''),
                    password=user_data['password'],
                    role=user_data.get('role', 'student')
                )
                if user_data.get('is_staff'):
                    user.is_staff = True
                if user_data.get('is_superuser'):
                    user.is_superuser = True
                user.save()
                self.stdout.write(f"  Created user: {username}")
            else:
                self.stdout.write(f"  User already exists: {username}")

    def seed_services(self, services_data):
        self.stdout.write("Seeding services and counters...")
        for service_data in services_data:
            service_name = service_data['name']
            service, created = Service.objects.get_or_create(
                name=service_name,
                defaults={'description': service_data.get('description', '')}
            )
            if created:
                self.stdout.write(f"  Created service: {service_name}")
            else:
                self.stdout.write(f"  Service already exists: {service_name}")

            for counter_data in service_data.get('counters', []):
                counter_name = counter_data['name']
                if not Counter.objects.filter(name=counter_name, service=service).exists():
                    Counter.objects.create(name=counter_name, service=service)
                    self.stdout.write(f"    - Created counter: {counter_name}")
                else:
                    self.stdout.write(f"    - Counter already exists: {counter_name}")
