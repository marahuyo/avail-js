import Transform from '../../components/transform.js';
import PolygonMaterial from '../../components/rendering/polygon-material.js';
import Polygon from '../../components/shapes/polygon.js';
import Ellipse from '../../components/shapes/ellipse.js';
import {DEG_TO_RAD} from '../../math/math.js';

/**
 * Handles rendering of `Polygon2dMaterial` unto a canvas element.
 *
 * @class PolygonRenderer2d
 */
class PolygonRenderer {
  /**
   * Creates an instance of SpriteRenderer.
   *
   * @param {HTMLCanvasElement} canvas
   * @memberof SpriteRenderer
   */
  constructor(canvas) {
    this._context = canvas.getContext('2d');
  }

  /**
   * Callback called every frame.
   *
   * @param {{deltaTime: number, time: number}} time
   * @param {import('../../core/package/entity-manager.js').default} manager
   * @memberof SpriteRenderer
   */
  update(time, manager) {
    this._context.clearRect(
      0,
      0,
      this._context.canvas.width,
      this._context.canvas.height,
    );

    const entities = manager.getEntitiesWithComponentType(PolygonMaterial);
    for (const entity of entities) {
      const material = manager.getComponent(entity, PolygonMaterial);
      const transform = manager.getComponent(entity, Transform);
      const position = transform.position;
      const scale = transform.scale;

      this._context.save();

      material.setStyling(this._context);

      const polygons = manager.getComponents(entity, Polygon);
      const matrix = transform.localToWorldMatrix;
      for (let i = 0; i < polygons.length; i++) {
        const vertices = polygons[i].vertices;

        this._context.beginPath();

        const first = matrix.multiplyVector2(vertices.get(0));
        this._context.moveTo(first.x, first.y);

        for (let i = 0; i < vertices.length; i++) {
          const vertex = matrix.multiplyVector2(vertices.get(i));
          this._context.lineTo(vertex.x, vertex.y);
        }

        this._context.lineTo(first.x, first.y);

        this._context.fill();
        this._context.stroke();

        this._context.closePath();
      }

      const ellipses = manager.getComponents(entity, Ellipse);
      for (let i = 0; i < ellipses.length; i++) {
        this._context.beginPath();

        this._context.ellipse(
          position.x,
          position.y,
          ellipses[i].radiusX * (scale.x / 2),
          ellipses[i].radiusY * (scale.y / 2),
          transform.rotation * DEG_TO_RAD,
          0,
          Math.PI * 2,
        );

        this._context.fill();
        this._context.stroke();

        this._context.closePath();
      }

      this._context.restore();
    }
  }
}

export default PolygonRenderer;
