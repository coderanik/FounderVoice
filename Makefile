.PHONY: api site webapp mobile android ios web landingpage install smoke

VENV := apps/api/.venv
PY := $(VENV)/bin/python

# Avoid common dev ports (3000–3002, 8081, etc.)
API_PORT := 8010
SITE_PORT := 4500
LANDING_PORT := 4600
EXPO_PORT := 19006

install:
	test -d $(VENV) || python3 -m venv $(VENV)
	$(PY) -m pip install -U pip
	$(PY) -m pip install -r apps/api/requirements.txt
	cd apps/web && pnpm install
	cd apps/mobile && npm install

api:
	bash scripts/open-when-ready.sh http://127.0.0.1:$(API_PORT)/docs & \
	cd apps/api && .venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port $(API_PORT)

site webapp:
	bash scripts/open-when-ready.sh http://127.0.0.1:$(SITE_PORT) & \
	cd apps/web && pnpm dev --port $(SITE_PORT)

landingpage:
	LANDING_PORT=$(LANDING_PORT) bash scripts/dev-landing.sh

mobile android:
	EXPO_PORT=$(EXPO_PORT) bash apps/mobile/scripts/start-android.sh

ios:
	EXPO_PORT=$(EXPO_PORT) bash apps/mobile/scripts/start-ios.sh

web:
	cd apps/mobile && npx expo start --web --port $(EXPO_PORT)

smoke:
	bash apps/api/scripts/smoke.sh
