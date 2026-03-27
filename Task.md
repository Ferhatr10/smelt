# Smelt - GitHub Actions for Daml CI/CD (Yol Haritası)

## FAZ 1: Monorepo ve Altyapı Kurulumu
- [ ] Ana proje klasörünün (`smelt-actions`) oluşturulması.
- [ ] `pnpm init` ile projenin başlatılması.
- [ ] `pnpm-workspace.yaml` dosyasının oluşturulup `packages/*` dizininin tanımlanması.
- [ ] Ortak bağımlılıkların (TypeScript, tsup, @types/node) ana dizine kurulması.
- [ ] `packages/setup`, `packages/build`, `packages/test`, `packages/deploy` klasör iskeletlerinin açılması.

## FAZ 2: `smelt-setup` Geliştirmesi (Çekirdek)
- [ ] `packages/setup` içine `package.json` ve `action.yml` eklenmesi.
- [ ] `@actions/core` ve `@actions/tool-cache` paketlerinin kurulması.
- [ ] Kullanıcıdan `sdk-version` bilgisinin alınması.
- [ ] İşletim sistemine (OS) göre doğru Daml SDK `.tar.gz` dosyasının indirilmesi.
- [ ] İndirilen dosyanın zipten çıkarılıp `core.addPath()` ile sistem yoluna (PATH) eklenmesi.
- [ ] `tsup` ile kodun `dist/index.js` olarak paketlenmesi (build).

## FAZ 3: `smelt-build` Geliştirmesi
- [ ] `packages/build` kurulumu ve `@actions/exec` kütüphanesinin eklenmesi.
- [ ] `action.yml` içine `project-dir` girdisinin (input) tanımlanması.
- [ ] Çalışma dizininin (cwd) kullanıcının belirttiği klasöre geçirilmesi.
- [ ] `daml build` komutunun terminalde çalıştırılması.
- [ ] Hata yakalama (try/catch) mantığının kurulması ve `tsup` ile paketleme.

## FAZ 4: `smelt-test` Geliştirmesi
- [ ] `packages/test` kurulumu.
- [ ] `action.yml` tanımlamaları.
- [ ] `daml test` komutunun çalıştırılması.
- [ ] Terminal çıktısının (stdout/stderr) dinlenip, testin başarısız olması durumunda aksiyonun `core.setFailed()` ile durdurulması.
- [ ] `tsup` ile paketleme.

## FAZ 5: `smelt-deploy` Geliştirmesi
- [ ] `packages/deploy` kurulumu ve `@actions/io` kütüphanesinin eklenmesi.
- [ ] `action.yml` girdileri: `dar-path`, `ledger-host`, `ledger-port`, `auth-token`.
- [ ] Güvenlik adımı: `auth-token` bilgisinin geçici bir dosyaya yazılması.
- [ ] `daml ledger upload-dar` komutunun doğru host ve port ile tetiklenmesi.
- [ ] İşlem bitince geçici token dosyasının güvenli bir şekilde silinmesi.
- [ ] `tsup` ile paketleme.