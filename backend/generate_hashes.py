from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

print("\n🔐 HASHES GENERADOS:\n")
print("Admin2026!:")
print(pwd_context.hash('Admin2026!'))
print("\nDocente2026!:")
print(pwd_context.hash('Docente2026!'))
print("\nEstudiante2026!:")
print(pwd_context.hash('Estudiante2026!'))
print("\n")
