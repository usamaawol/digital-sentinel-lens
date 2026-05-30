# Privacy Guard AI — Android Kotlin Security Engine

## Architecture Overview

```
android/app/src/main/java/com/privacyguard/ai/
│
├── PrivacyGuardApplication.kt          # Hilt entry point, WorkManager init
│
├── di/                                  # Hilt dependency injection modules
│   ├── DatabaseModule.kt               # Room database + DAOs
│   ├── RepositoryModule.kt             # Repository interface bindings
│   ├── AiModule.kt                     # AI service + OpenRouter Retrofit
│   ├── FirebaseModule.kt               # Firebase Auth + Firestore
│   └── WorkerModule.kt                 # WorkManager
│
├── domain/                              # Pure Kotlin — no Android dependencies
│   ├── model/
│   │   ├── AppInfo.kt                  # Core app entity + AppCategory + RiskLevel
│   │   ├── PermissionInfo.kt           # Permission entity + PermissionCatalog
│   │   ├── ScanResult.kt               # Scan result + PermissionChange
│   │   └── PrivacyReport.kt            # Weekly report + SecurityNotification
│   ├── repository/
│   │   ├── AppRepository.kt            # App data contract
│   │   ├── ScanRepository.kt           # Scan history contract
│   │   ├── ReportRepository.kt         # Reports + notifications contract
│   │   ├── AiRepository.kt             # AI integration contract
│   │   └── future/                     # Architecture stubs for future features
│   │       ├── NetworkMonitorRepository.kt
│   │       ├── BehavioralAnalysisRepository.kt
│   │       └── AdSdkDetectionRepository.kt
│   ├── scoring/
│   │   └── PrivacyScoringEngine.kt     # Privacy score algorithm (0-100)
│   └── usecase/
│       ├── ScanAppsUseCase.kt
│       ├── GetAppsUseCase.kt
│       ├── GenerateReportUseCase.kt
│       └── AnalyzePolicyUseCase.kt
│
├── data/                                # Android-specific implementations
│   ├── local/
│   │   ├── PrivacyGuardDatabase.kt     # Room database
│   │   ├── dao/                        # AppDao, ScanDao, ReportDao
│   │   ├── entity/                     # AppEntity, ScanEntity, ReportEntity
│   │   └── converter/                  # RoomConverters
│   ├── scanner/
│   │   └── AppScanner.kt               # PackageManager integration
│   ├── repository/
│   │   ├── AppRepositoryImpl.kt        # Scan + score + persist + sync
│   │   ├── ScanRepositoryImpl.kt       # Scan history persistence
│   │   └── ReportRepositoryImpl.kt     # Reports + notifications
│   ├── ai/
│   │   ├── MockAiRepository.kt         # Mock AI (no API key needed)
│   │   ├── OpenRouterAiRepository.kt   # Real AI (requires API key)
│   │   └── network/
│   │       ├── OpenRouterApiService.kt # Retrofit interface
│   │       └── OpenRouterAuthInterceptor.kt
│   ├── worker/
│   │   ├── DailyScanWorker.kt          # WorkManager daily scan
│   │   ├── WeeklyReportWorker.kt       # WorkManager weekly report
│   │   └── BackgroundScanScheduler.kt  # Schedules all workers
│   ├── notification/
│   │   ├── NotificationDispatcher.kt   # Android notification channels
│   │   └── PrivacyGuardMessagingService.kt  # FCM service
│   ├── receiver/
│   │   ├── PackageChangeReceiver.kt    # App install/remove detection
│   │   └── BootReceiver.kt             # Reschedule after reboot
│   └── sync/
│       └── FirestoreSyncService.kt     # Bridges Android data → web dashboard
│
└── presentation/
    ├── MainActivity.kt
    ├── PrivacyGuardNavHost.kt
    ├── theme/
    ├── screen/                          # Jetpack Compose screens
    └── viewmodel/
        ├── DashboardViewModel.kt
        ├── AppsViewModel.kt
        ├── AppDetailViewModel.kt
        ├── AssistantViewModel.kt
        └── PolicyAnalyzerViewModel.kt
```

## Required Android Permissions

| Permission | Feature | Notes |
|---|---|---|
| `QUERY_ALL_PACKAGES` | App Scanner | Required on Android 11+ to list all apps |
| `PACKAGE_USAGE_STATS` | Weekly Reports | Special permission — user must grant in Settings |
| `POST_NOTIFICATIONS` | Notifications | Required on Android 13+ |
| `RECEIVE_BOOT_COMPLETED` | Background Scanning | Reschedule WorkManager after reboot |
| `INTERNET` | AI Integration | OpenRouter API calls |
| `ACCESS_NETWORK_STATE` | Future: Network Analysis | Check connectivity |
| `FOREGROUND_SERVICE` | Background Scanning | Foreground service for scanner |

## API Key Configuration

### OpenRouter (AI Features)

1. Add to `local.properties` (never commit this file):
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. In `app/build.gradle.kts`, expose via BuildConfig:
   ```kotlin
   buildConfigField("String", "OPENROUTER_API_KEY",
       "\"${properties["OPENROUTER_API_KEY"]}\"")
   ```

3. In `di/AiModule.kt`, change the binding:
   ```kotlin
   // Change from:
   abstract fun bindAiRepository(impl: MockAiRepository): AiRepository
   // To:
   abstract fun bindAiRepository(impl: OpenRouterAiRepository): AiRepository
   ```

## Firebase Configuration

The Android app uses the same Firebase project as the web frontend:
- Project ID: `privacy-app-aba91`
- Download `google-services.json` from Firebase Console and place in `android/app/`

## Firestore Data Flow

```
Android App (Kotlin)
    ↓ scans device
    ↓ scores apps
    ↓ FirestoreSyncService.syncApps()
    ↓
Firestore: users/{uid}/apps/{packageName}
    ↑
Web Dashboard (React)
    ↑ firestoreService.listApps()
    ↑ reads same collection
```

## Running Tests

```bash
cd android
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest    # Instrumented tests (requires device/emulator)
```

## Score Algorithm

```
Base score: 100

Penalties:
  - Dangerous permission count:  -5 to -35
  - Permission risk weights:     -0 to -40
  - Purpose mismatch:            -0 to -28
  - Background location:         -15

Bonuses:
  - System app:                  +5

Final score clamped to [0, 100]

Bands:
  90-100 = Safe
  70-89  = Low Risk
  40-69  = Medium Risk
  0-39   = High Risk
```

## Future Features (Architecture Ready)

The following features have architecture stubs in `domain/repository/future/`:

- **VPN Service Monitoring** — `NetworkMonitorRepository`
- **Network Traffic Analysis** — `NetworkMonitorRepository`
- **Tracker Detection** — `AdSdkDetectionRepository`
- **Ad SDK Detection** — `AdSdkDetectionRepository`
- **Behavioral Analysis** — `BehavioralAnalysisRepository`
- **AI Anomaly Detection** — `BehavioralAnalysisRepository`
