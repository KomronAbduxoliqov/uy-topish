import { SanitizeInputPipe } from '../src/common/pipes/sanitize.pipe';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { of } from 'rxjs';

describe('Security Hardening & Protection Tests', () => {
  describe('SanitizeInputPipe (XSS & Injection Protection)', () => {
    const pipe = new SanitizeInputPipe();

    it('should strip malicious <script> tags and payloads from strings', () => {
      const malicious = 'Shinam xonadon <script>alert("XSS Attack")</script> Chilonzorda';
      const cleaned = pipe.transform(malicious, { type: 'body' });
      expect(cleaned).toBe('Shinam xonadon  Chilonzorda');
      expect(cleaned).not.toContain('<script>');
    });

    it('should strip <iframe>, <object>, and javascript: protocol vectors', () => {
      const payload = '<iframe src="http://evil.com"></iframe><a href="javascript:stealCookies()">Click me</a>';
      const cleaned = pipe.transform(payload, { type: 'body' });
      expect(cleaned).not.toContain('<iframe');
      expect(cleaned).not.toContain('javascript:');
    });

    it('should recursively sanitize nested object payloads', () => {
      const dirtyDto = {
        titleUz: 'Kvartira <script>hack()</script>',
        descriptionUz: '<p>Tavsif onmouseover="exploit()"</p>',
        tags: ['ijara', '<script>alert(1)</script>'],
        details: {
          address: 'Amir Temur ko\'chasi <embed src="payload.swf">'
        }
      };

      const cleaned = pipe.transform(dirtyDto, { type: 'body' });
      expect(cleaned.titleUz).toBe('Kvartira');
      expect(cleaned.tags[1]).toBe('');
      expect(cleaned.details.address).toBe('Amir Temur ko\'chasi');
    });
  });

  describe('TransformInterceptor (Sensitive Data Exposure Protection)', () => {
    const interceptor = new TransformInterceptor();

    it('should recursively strip passwordHash and refreshToken from responses', async () => {
      const mockUserResponse = {
        id: 'user-123',
        phone: '+998901234567',
        fullName: 'Rustam Karimov',
        passwordHash: '$2b$12$superSecretHashNeverExposeToClient',
        refreshToken: 'secretRefreshToken',
        role: 'USER'
      };

      const mockCallHandler = {
        handle: () => of(mockUserResponse)
      };

      const mockContext = {} as any;

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
        expect(result.success).toBe(true);
        expect(result.data.id).toBe('user-123');
        expect(result.data.passwordHash).toBeUndefined();
        expect(result.data.refreshToken).toBeUndefined();
      });
    });
  });
});
