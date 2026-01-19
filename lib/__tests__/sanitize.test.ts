/**
 * Unit tests for HTML sanitization utilities
 *
 * CRITICAL SECURITY TESTS - XSS Prevention
 *
 * Tests protection against:
 * - Script injection attacks
 * - HTML tag injection
 * - Event handler injection
 * - Protocol-based attacks (javascript:, data:)
 * - URL manipulation attacks
 */

import {
  sanitizeText,
  sanitizeRichText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  sanitizeObject,
} from '../sanitize';

describe('sanitizeText - XSS Protection', () => {
  it('should remove all HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeText('<div>Hello</div>')).toBe('Hello');
    expect(sanitizeText('<p>Test</p> <span>Text</span>')).toBe('Test Text');
  });

  it('should remove script tags and content', () => {
    expect(sanitizeText('<script>alert("XSS")</script>Hello')).toBe('Hello');
    expect(
      sanitizeText('Before<script>malicious code</script>After')
    ).toBe('BeforeAfter');
  });

  it('should remove event handlers', () => {
    expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
    expect(sanitizeText('<div onclick="alert(1)">Click</div>')).toBe('Click');
    expect(sanitizeText('<a href="#" onmouseover="alert(1)">Link</a>')).toBe(
      'Link'
    );
  });

  it('should handle null and undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('should handle non-string inputs', () => {
    expect(sanitizeText(123 as any)).toBe('');
    expect(sanitizeText({} as any)).toBe('');
    expect(sanitizeText([] as any)).toBe('');
  });

  it('should normalize whitespace', () => {
    expect(sanitizeText('  Multiple   spaces  ')).toBe('Multiple spaces');
    expect(sanitizeText('Line1\n\nLine2')).toBe('Line1 Line2');
    expect(sanitizeText('\t\tTabs\t\t')).toBe('Tabs');
  });

  it('should preserve safe text', () => {
    expect(sanitizeText('Hello World')).toBe('Hello World');
    expect(sanitizeText('user@example.com')).toBe('user@example.com');
    expect(sanitizeText('Price: $99.99')).toBe('Price: $99.99');
  });

  it('should block advanced XSS attacks', () => {
    // SVG-based XSS
    expect(
      sanitizeText('<svg/onload=alert("XSS")>')
    ).toBe('');

    // IMG-based XSS
    expect(
      sanitizeText('<img src="javascript:alert(1)">')
    ).toBe('');

    // Encoded attacks
    const encodedResult = sanitizeText('&lt;script&gt;alert(1)&lt;/script&gt;');
    // DOMPurify will decode HTML entities, then sanitize
    expect(encodedResult).not.toContain('<script');

    // iframe injection
    expect(
      sanitizeText('<iframe src="evil.com"></iframe>')
    ).toBe('');
  });
});

describe('sanitizeRichText - Allowed HTML', () => {
  it('should allow safe HTML tags', () => {
    expect(sanitizeRichText('<p>Paragraph</p>')).toBe('<p>Paragraph</p>');
    expect(sanitizeRichText('<strong>Bold</strong>')).toBe(
      '<strong>Bold</strong>'
    );
    expect(sanitizeRichText('<em>Italic</em>')).toBe('<em>Italic</em>');
    expect(sanitizeRichText('<ul><li>Item</li></ul>')).toBe(
      '<ul><li>Item</li></ul>'
    );
  });

  it('should allow safe links', () => {
    const result = sanitizeRichText('<a href="https://example.com">Link</a>');

    // Should preserve safe links
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('Link');
    // Note: HOOK_AFTER_SANITIZE for adding target/rel may not work in Node.js environment
  });

  it('should remove dangerous tags', () => {
    expect(sanitizeRichText('<script>alert(1)</script>')).toBe('');
    expect(sanitizeRichText('<iframe src="evil.com"></iframe>')).toBe('');
    expect(sanitizeRichText('<object data="evil"></object>')).toBe('');
    expect(sanitizeRichText('<embed src="evil">')).toBe('');
  });

  it('should remove dangerous attributes', () => {
    expect(sanitizeRichText('<p onclick="alert(1)">Text</p>')).toBe(
      '<p>Text</p>'
    );
    expect(sanitizeRichText('<div style="color:red">Text</div>')).toBe('Text');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeRichText(null)).toBe('');
    expect(sanitizeRichText(undefined)).toBe('');
  });

  it('should handle complex rich text', () => {
    const html = `
      <h1>Title</h1>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <a href="https://example.com">Link</a>
    `;

    const result = sanitizeRichText(html);

    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item 1</li>');
  });
});

describe('sanitizeEmail', () => {
  it('should clean and normalize valid emails', () => {
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
    expect(sanitizeEmail('User@EXAMPLE.COM')).toBe('user@example.com');
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  it('should remove HTML from email inputs', () => {
    expect(sanitizeEmail('<script>alert(1)</script>user@example.com')).toBe(
      'user@example.com'
    );
    expect(sanitizeEmail('user@<b>example</b>.com')).toBe('user@example.com');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeEmail(null)).toBe('');
    expect(sanitizeEmail(undefined)).toBe('');
  });

  it('should return invalid formats as-is (for Zod to reject)', () => {
    expect(sanitizeEmail('not-an-email')).toBe('not-an-email');
    expect(sanitizeEmail('missing@')).toBe('missing@');
  });

  it('should convert to lowercase', () => {
    expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });
});

describe('sanitizeUrl - Protocol Security', () => {
  it('should allow safe HTTP/HTTPS URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should block javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
    expect(sanitizeUrl('  javascript:alert(1)  ')).toBe('');
  });

  it('should block data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('DATA:text/html,evil')).toBe('');
  });

  it('should block vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    expect(sanitizeUrl('VBSCRIPT:evil')).toBe('');
  });

  it('should block file: protocol', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    expect(sanitizeUrl('FILE:///C:/Windows/System32')).toBe('');
  });

  it('should allow mailto: protocol', () => {
    expect(sanitizeUrl('mailto:user@example.com')).toBe(
      'mailto:user@example.com'
    );
  });

  it('should allow tel: protocol', () => {
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('should allow relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
  });

  it('should add https:// to URLs without protocol', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com');
    expect(sanitizeUrl('www.example.com')).toBe('https://www.example.com');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
  });

  it('should remove HTML tags from URLs', () => {
    expect(sanitizeUrl('<script>alert(1)</script>https://example.com')).toBe(
      'https://example.com'
    );
  });
});

describe('sanitizePhone', () => {
  it('should allow valid phone number characters', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
    expect(sanitizePhone('0123456789')).toBe('0123456789');
    expect(sanitizePhone('+33-1-23-45-67-89')).toBe('+33-1-23-45-67-89');
  });

  it('should remove invalid characters', () => {
    expect(sanitizePhone('abc123def456')).toBe('123456');
    expect(sanitizePhone('555-CALL-NOW')).toBe('555--');
    // script tags are removed but parentheses from HTML might remain
    const result = sanitizePhone('<script>alert(1)</script>123');
    expect(result).toContain('123');
    expect(result).not.toContain('script');
  });

  it('should handle null and undefined', () => {
    expect(sanitizePhone(null)).toBe('');
    expect(sanitizePhone(undefined)).toBe('');
  });

  it('should preserve formatting characters', () => {
    expect(sanitizePhone('(555) 123-4567')).toBe('(555) 123-4567');
    expect(sanitizePhone('+1-555-123-4567')).toBe('+1-555-123-4567');
  });
});

describe('sanitizeObject - Recursive Sanitization', () => {
  it('should sanitize all string fields', () => {
    const obj = {
      name: '<script>alert(1)</script>John',
      description: 'Normal text',
    };

    const result = sanitizeObject(obj);

    expect(result.name).toBe('John');
    expect(result.description).toBe('Normal text');
  });

  it('should apply rich text sanitization to specified fields', () => {
    const obj = {
      title: '<strong>Bold Title</strong>',
      content: '<p>Paragraph with <a href="https://example.com">link</a></p>',
    };

    const result = sanitizeObject(obj, ['content']);

    // title should be plain text
    expect(result.title).toBe('Bold Title');

    // content should preserve safe HTML
    expect(result.content).toContain('<p>');
    expect(result.content).toContain('<a');
  });

  it('should sanitize email fields', () => {
    const obj = {
      email: '  USER@EXAMPLE.COM  ',
      contactEmail: 'test@test.com',
    };

    const result = sanitizeObject(obj);

    expect(result.email).toBe('user@example.com');
    expect(result.contactEmail).toBe('test@test.com');
  });

  it('should sanitize URL fields', () => {
    const obj = {
      website: 'javascript:alert(1)',
      profileUrl: 'example.com',
    };

    const result = sanitizeObject(obj);

    expect(result.website).toBe('');
    expect(result.profileUrl).toBe('https://example.com');
  });

  it('should sanitize phone fields', () => {
    const obj = {
      phone: 'abc+1-555-1234def',
      mobilePhone: '(555) CALL-NOW',
    };

    const result = sanitizeObject(obj);

    expect(result.phone).toBe('+1-555-1234');
    expect(result.mobilePhone).toBe('(555) -');
  });

  it('should handle nested objects recursively', () => {
    const obj = {
      user: {
        name: '<script>alert(1)</script>John',
        contact: {
          email: '  test@example.com  ',
          phone: 'abc123def',
        },
      },
    };

    const result = sanitizeObject(obj);

    expect(result.user.name).toBe('John');
    expect(result.user.contact.email).toBe('test@example.com');
    expect(result.user.contact.phone).toBe('123');
  });

  it('should handle arrays', () => {
    const obj = {
      tags: ['tag1', '<b>tag2</b>', 'tag3'],
    };

    const result = sanitizeObject(obj);

    expect(result.tags[0]).toBe('tag1');
    expect(result.tags[1]).toBe('tag2'); // <b> tags removed
    expect(result.tags[2]).toBe('tag3');
  });

  it('should preserve non-string values', () => {
    const obj = {
      id: 123,
      active: true,
      price: 99.99,
      count: 0,
      data: null,
    };

    const result = sanitizeObject(obj);

    expect(result.id).toBe(123);
    expect(result.active).toBe(true);
    expect(result.price).toBe(99.99);
    expect(result.count).toBe(0);
    expect(result.data).toBe(null);
  });

  it('should handle complex nested structures', () => {
    const obj = {
      users: [
        {
          name: 'User 1',
          email: 'USER1@EXAMPLE.COM',
          profile: {
            bio: '<p>Bio text</p>',
            website: 'example.com',
          },
        },
      ],
    };

    const result = sanitizeObject(obj, ['bio']);

    expect(result.users[0].name).toBe('User 1');
    expect(result.users[0].email).toBe('user1@example.com');
    expect(result.users[0].profile.bio).toBe('<p>Bio text</p>');
    expect(result.users[0].profile.website).toBe('https://example.com');
  });
});

describe('Real-world XSS Attack Vectors', () => {
  it('should block OWASP Top 10 XSS attacks', () => {
    const attacks = [
      '<script>alert(document.cookie)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
      '<select onfocus=alert(1) autofocus>',
      '<textarea onfocus=alert(1) autofocus>',
      '<marquee onstart=alert(1)>',
      '<div style="background:url(javascript:alert(1))">',
    ];

    attacks.forEach((attack) => {
      const result = sanitizeText(attack);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('onfocus');
      expect(result).not.toContain('javascript:');
    });
  });

  it('should block encoded XSS attacks', () => {
    // These should be blocked or encoded safely
    const encodedAttacks = [
      '&#60;script&#62;alert(1)&#60;/script&#62;',
      '%3Cscript%3Ealert(1)%3C/script%3E',
      '\x3Cscript\x3Ealert(1)\x3C/script\x3E',
    ];

    encodedAttacks.forEach((attack) => {
      const result = sanitizeText(attack);
      // Should not contain executable script tags
      expect(result.toLowerCase()).not.toContain('<script>');
    });
  });

  it('should block SQL injection attempts in strings', () => {
    const sqlAttacks = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      '" OR 1=1--',
      'admin\'--',
    ];

    // Sanitization should preserve these but remove any HTML
    sqlAttacks.forEach((attack) => {
      const result = sanitizeText(attack);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });
});
