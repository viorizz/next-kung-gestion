// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hero } from '@/components/ui/hero';
import { Header } from '@/components/ui/header';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero />

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
              Fonctionnalités clés
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-yellow-400">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Commandes centralisées
                </h3>
                <p className="text-gray-600">
                  Accédez à toutes les feuilles de commande des fabricants suisses en un seul endroit.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-yellow-400">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Comparaison de produits
                </h3>
                <p className="text-gray-600">
                  Comparez les produits similaires pour trouver la meilleure solution pour votre projet.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-yellow-400">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Données réutilisables
                </h3>
                <p className="text-gray-600">
                  Enregistrez les informations de projet une fois et pré-remplissez plusieurs commandes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
              Comment ça marche ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-400 text-2xl font-bold mb-4 shadow">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-2">Créez un compte</h4>
                <p className="text-gray-600">
                  Inscrivez-vous gratuitement et accédez à la plateforme.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-400 text-2xl font-bold mb-4 shadow">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-2">Ajoutez vos projets</h4>
                <p className="text-gray-600">
                  Centralisez les données de vos projets pour une gestion simplifiée.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-400 text-2xl font-bold mb-4 shadow">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-2">Passez vos commandes</h4>
                <p className="text-gray-600">
                  Remplissez et envoyez vos commandes en quelques clics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
              Ils nous font confiance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="text-gray-700 italic mb-4">
                  “Kung Gestion a révolutionné notre façon de gérer les commandes. Un vrai gain de temps !”
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-600">
                    JD
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Jean Dupont</div>
                    <div className="text-sm text-gray-500">Ingénieur civil</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="text-gray-700 italic mb-4">
                  “La comparaison des produits est ultra pratique. Je recommande à tous les dessinateurs.”
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-600">
                    ML
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marie Leroy</div>
                    <div className="text-sm text-gray-500">Dessinateur</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="text-gray-700 italic mb-4">
                  “Une plateforme intuitive et efficace pour centraliser toutes nos commandes.”
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-600">
                    PB
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Paul Bernard</div>
                    <div className="text-sm text-gray-500">Chef de projet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-yellow-400">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à simplifier la gestion de vos commandes ?
            </h2>
            <Button asChild size="lg" className="bg-gray-900 text-yellow-400 font-bold hover:bg-gray-800">
              <Link href="/sign-up">Commencer gratuitement</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Kung Gestion. Tous droits réservés.
              </p>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Conditions d'utilisation
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}