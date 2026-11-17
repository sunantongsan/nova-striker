// 430: หุ่นรบ (kind 2) is now an android rocket trooper: kneels to fire a shoulder rocket launcher (KneelFire clip,
// art from features/render3d/rocket430), rockets splash and hit both ground and air (weapon 'missile' passes canDamage285).
// Range grows from melee 1.2 to 3.2 tiles; slower, heavier shots keep its damage per second about the same.
U[2].weapon='missile';U[2].range=3.2;U[2].damage=56;U[2].rate=1.2;U[2].splash=.9;
U[2].description=mt251('ย่อตัวยิงจรวด โจมตีได้ทั้งภาคพื้นและอากาศ','Kneels to fire rockets • hits ground and air');
if(typeof unit3dKinds392!=='undefined'&&unit3dKinds392[2])unit3dKinds392[2].height=52;
