# Contributing to Lumina Medical AI Platform

We welcome contributions to the Lumina Medical AI Platform! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use a clear, descriptive title** for the issue
3. **Provide detailed reproduction steps** if reporting a bug
4. **Include relevant environment information** (browser, OS, etc.)

### Development Process

1. **Fork the repository** and create your branch from `main`
2. **Set up the development environment** following the README instructions
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Update documentation** if necessary
6. **Submit a pull request** with a clear description

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/improvements

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Local Development

```bash
# Clone your fork
git clone https://github.com/yourusername/lumina-medical-ai.git
cd lumina-medical-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Code Style

We use the following tools and conventions:

- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling with our medical design system

#### Code Style Guidelines

1. **Use TypeScript** for all new code
2. **Follow existing naming conventions**
3. **Use semantic HTML** elements where appropriate
4. **Implement proper error handling**
5. **Add JSDoc comments** for complex functions
6. **Use the medical design system** tokens instead of custom colors

#### Component Guidelines

```typescript
// ✅ Good: Proper TypeScript interface
interface MedicalImageProps {
  imageUrl: string;
  analysisId: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

// ✅ Good: Use design system colors
<Button variant="medical" className="clinical-shadow">

// ❌ Avoid: Custom colors
<Button className="bg-blue-500 shadow-lg">
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

### Test Guidelines

1. **Write tests for new features** and bug fixes
2. **Use descriptive test names** that explain the expected behavior
3. **Mock external dependencies** appropriately
4. **Test both success and error cases**
5. **Maintain good test coverage** (aim for 80%+)

Example test structure:

```typescript
describe('MedicalImageAnalysis', () => {
  it('should successfully analyze uploaded medical image', async () => {
    // Arrange
    const mockImage = createMockMedicalImage();
    
    // Act
    const result = await analyzeImage(mockImage);
    
    // Assert
    expect(result.status).toBe('analyzed');
    expect(result.findings).toBeDefined();
  });
});
```

## 🎨 Design System

When contributing UI components, please:

1. **Use existing design tokens** from `src/index.css`
2. **Follow the medical color palette** (medical-primary, medical-accent, etc.)
3. **Implement responsive design** with mobile-first approach
4. **Ensure accessibility** (WCAG 2.1 AA compliance)
5. **Use shadcn/ui components** as base components

### Color Usage

```css
/* ✅ Good: Use design system tokens */
.medical-button {
  background: hsl(var(--medical-primary));
  color: hsl(var(--medical-primary-foreground));
}

/* ❌ Avoid: Hard-coded colors */
.medical-button {
  background: #123C54;
  color: white;
}
```

## 📋 Pull Request Process

### Before Submitting

1. **Ensure your code follows** the style guidelines
2. **Run the test suite** and ensure all tests pass
3. **Update documentation** if you've added new features
4. **Test in multiple browsers** if applicable
5. **Rebase your branch** on the latest main branch

### Pull Request Template

When submitting a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass (tests, linting, build)
2. **Code review** by at least one maintainer
3. **Manual testing** for UI changes
4. **Documentation review** if applicable
5. **Merge** after approval

## 🏥 Healthcare-Specific Guidelines

Given the medical nature of this platform:

1. **Patient Privacy**: Never commit test data with real patient information
2. **Security**: Follow HIPAA compliance guidelines in code
3. **Accuracy**: Medical terminology and calculations must be precise
4. **Accessibility**: Healthcare professionals may have different accessibility needs
5. **Error Handling**: Medical applications require robust error handling

### Sample Data Guidelines

```typescript
// ✅ Good: Anonymized test data
const mockPatientData = {
  id: 'test-patient-001',
  age: 45,
  studyType: 'chest-xray',
  // No real patient information
};

// ❌ Avoid: Real or realistic patient data
const mockPatientData = {
  name: 'John Smith',
  ssn: '123-45-6789',
  // Real patient information
};
```

## 🆘 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the README and inline documentation
- **Code Comments**: Most complex logic is documented in the code

## 📚 Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/for-professionals/index.html)

## 📄 Code of Conduct

This project follows a Code of Conduct that we expect all contributors to adhere to. Please be respectful and professional in all interactions.

### Our Standards

- **Be inclusive and welcoming** to all contributors
- **Respect different viewpoints** and experiences
- **Focus on what's best** for the community and project
- **Show empathy** towards other community members
- **Communicate constructively** and professionally

Thank you for contributing to Lumina Medical AI Platform! 🙏