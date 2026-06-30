Steamon Gym Badges — resourcepack maison (custom_model_data sur minecraft:paper)

Item de base : minecraft:paper. Chaque badge = un paper avec un custom_model_data.

Commande pour donner un badge (gym leader, 1.21.1) :
  /give @p minecraft:paper[custom_model_data=1001,custom_name='{"text":"Boulder Badge"}']

Table des badges :
  1001  Boulder Badge   (badge_boulder)
  1002  Cascade Badge   (badge_cascade)
  1003  Thunder Badge   (badge_thunder)
  1004  Rainbow Badge   (badge_rainbow)
  1005  Soul Badge      (badge_soul)
  1006  Marsh Badge     (badge_marsh)
  1007  Volcano Badge   (badge_volcano)
  1008  Earth Badge     (badge_earth)

Pour changer l'art : remplacer le PNG dans assets/steamon/textures/item/<slug>.png
  Taille recommandee : 16x16 (32x32 accepte aussi, sera downscale a l'affichage).

Pour ajouter un badge :
  1. nouveau PNG  assets/steamon/textures/item/badge_xxx.png
  2. nouveau model assets/steamon/models/item/badge_xxx.json (copier un existant)
  3. ajouter un override dans assets/minecraft/models/item/paper.json (nouveau custom_model_data)
