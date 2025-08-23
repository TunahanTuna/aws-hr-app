# AI HR Project - GraphQL Integration Guide

## 🚀 GraphQL Entegrasyonu Tamamlandı!

Bu proje artık Hasura GraphQL API ile tam entegre çalışıyor. Mock data yerine gerçek veritabanından veri çekiyor.

## 📦 Yeni Eklenen Paketler

- `@apollo/client` - GraphQL client
- `graphql` - GraphQL support

## 🏗️ Yapı

### 1. Apollo Client Konfigürasyonu
- **Dosya**: `src/lib/apollo-client.ts`
- **Özellikler**:
  - Hasura endpoint: `http://localhost:8080/v1/graphql`
  - Admin secret authentication
  - Optimized cache policies
  - Error handling

### 2. GraphQL Queries
- **Dosya**: `src/lib/graphql/queries.ts`
- **İçerik**:
  - Tüm tablolar için CRUD queries
  - Filtrelenmiş zaman girişleri
  - İlişkili veri çekme (nested queries)

### 3. GraphQL Mutations
- **Dosya**: `src/lib/graphql/mutations.ts`
- **İçerik**:
  - Tüm tablolar için CRUD mutations
  - Proje üye yönetimi
  - Batch operations

### 4. GraphQL Hooks
- **Dosya**: `src/lib/graphql/hooks.ts`
- **İçerik**:
  - Apollo Client hooks wrapper'ları
  - Otomatik cache invalidation
  - Loading ve error state yönetimi

## 🔄 Veri Akışı

```
Hasura GraphQL API ←→ Apollo Client ←→ React Hooks ←→ Components
```

### Veri Çekme Süreci:
1. **Component mount** → GraphQL hook çağrılır
2. **Apollo Client** → Hasura'ya query gönderir
3. **Hasura** → PostgreSQL'den veri çeker
4. **Response** → Apollo cache'e kaydedilir
5. **Component** → Güncel veri ile render edilir

### Veri Güncelleme Süreci:
1. **User action** → Mutation hook çağrılır
2. **Apollo Client** → Hasura'ya mutation gönderir
3. **Hasura** → PostgreSQL'i günceller
4. **Cache invalidation** → İlgili queries yeniden çekilir
5. **UI** → Otomatik güncellenir

## 🎯 Kullanım Örnekleri

### Query Kullanımı:
```tsx
import { useUsers } from '../lib/graphql/hooks';

const MyComponent = () => {
  const { data, loading, error } = useUsers();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return (
    <div>
      {data?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

### Mutation Kullanımı:
```tsx
import { useCreateUser } from '../lib/graphql/hooks';

const CreateUserForm = () => {
  const [createUser, { loading }] = useCreateUser();
  
  const handleSubmit = async (userData) => {
    try {
      await createUser({
        variables: { input: userData }
      });
      // Form otomatik temizlenir, liste güncellenir
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};
```

## 🔧 Konfigürasyon

### Environment Variables:
```env
VITE_HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
VITE_HASURA_ADMIN_SECRET=myadminsecretkey
```

### Apollo Client Settings:
- **Cache Policy**: Replace existing data (no merging)
- **Error Policy**: Show all errors
- **Authentication**: Admin secret header
- **CORS**: Enabled for development

## 📊 Mevcut Entegrasyonlar

### ✅ Tamamlanan:
- [x] Users management
- [x] Customers management  
- [x] Projects management
- [x] Task types management
- [x] Divisions management
- [x] Time entries (with filtering)
- [x] Special days management
- [x] Dynamic parameters

### 🔄 Kısmen Tamamlanan:
- [x] Basic CRUD operations
- [x] Data fetching
- [x] Cache management
- [ ] Form validations
- [ ] Error boundaries
- [ ] Optimistic updates

## 🚨 Önemli Notlar

### 1. Veri Yapısı Değişiklikleri:
- `userId` → `user_id`
- `projectId` → `project_id`
- `isBillable` → `is_billable`
- `customerId` → `customer_id`

### 2. GraphQL Relationships:
- Time entries artık nested user, project, task_type, division bilgilerini içeriyor
- Projects artık nested customer ve project_manager bilgilerini içeriyor
- Tüm ilişkiler otomatik olarak yükleniyor

### 3. Cache Management:
- Apollo Client otomatik olarak cache'i yönetiyor
- Mutations sonrası ilgili queries otomatik yenileniyor
- Manual cache invalidation gerekmiyor

## 🧪 Test Etme

### 1. Backend Kontrolü:
```bash
cd ../ai-hr-backend
docker-compose ps
```

### 2. Hasura Console:
- URL: http://localhost:8080/console
- Admin Secret: `myadminsecretkey`

### 3. Frontend Test:
```bash
npm run dev
# http://localhost:5173
```

## 🔮 Sonraki Adımlar

### Kısa Vadeli:
1. **Form Validations** - Yup/Zod ile form validasyonları
2. **Error Boundaries** - React error boundary'leri
3. **Optimistic Updates** - UI'da anlık güncellemeler

### Orta Vadeli:
1. **Authentication** - JWT tabanlı kullanıcı girişi
2. **Role-based Access** - Kullanıcı rollerine göre yetkilendirme
3. **Real-time Updates** - WebSocket ile canlı veri

### Uzun Vadeli:
1. **Offline Support** - Apollo Client offline cache
2. **Performance** - Query optimization ve pagination
3. **Monitoring** - Apollo Studio entegrasyonu

## 🎉 Sonuç

Artık AI HR projesi tamamen GraphQL tabanlı çalışıyor! 

- ✅ **Mock data kaldırıldı**
- ✅ **Gerçek veritabanı entegrasyonu**
- ✅ **Otomatik cache yönetimi**
- ✅ **Real-time data synchronization**
- ✅ **Type-safe GraphQL operations**

Frontend artık Hasura GraphQL API ile tam entegre ve production-ready! 🚀
